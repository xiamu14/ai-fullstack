"""Per-run native capabilities for mutable permissions, plans and role context."""
from contextlib import nullcontext
from pathlib import Path

from pydantic_ai.capabilities import AbstractCapability, CombinedCapability, HandleDeferredToolCalls
from pydantic_ai_harness import AskUser, Planning
from pydantic_ai_harness.planning import SqlitePlanStore
from pydantic_ai_harness.subagents import DelegationTasks

from agent.permissions.policy import ExecutionPermissions
from agent.roles import ROLES
from context.project import ProjectContext
from storage.execution_lock import execution_lock
from integrations.mcp import MCPRegistry
from agent.mcp_services import RunMCP
from agent.delegation import BORROWED_WORKSPACE_LEASE


class RoleServices(AbstractCapability):
    def __init__(self, runtime, role, root_services=None):
        self.runtime = runtime
        self.role = role
        self.root_services = root_services

    async def for_run(self, ctx):
        child = DelegationTasks.child_id()
        if child is None and self.root_services is not None:
            from functools import partial
            from dataclasses import replace
            policy = next(item for item in self.root_services if isinstance(item, ExecutionPermissions))
            settled = [replace(record) for record in self.runtime.owner.records.values() if record.status == "finished"]
            policy.review_gate = partial(self.runtime.check_deliverables, settled)
            return CombinedCapability(self.root_services)
        root = Path(await ctx.workspace.working_dir()).resolve()
        policy = ExecutionPermissions(root, self.runtime.broker, self.runtime.database, self.runtime.mcp_path)
        policy.role_read_only = ROLES[self.role].read_only
        policy.allow_sandboxed_shell = self.role in {"super", "executor"}
        if self.role != "super":
            policy.libraries = tuple(Path(__file__).resolve().parents[1] / path for path in ROLES[self.role].skills)
            policy.refresh_readonly()
        # Each child has its own plan. A clone cannot replace its parent's approved plan.
        store = SqlitePlanStore(str(self.runtime.database), session=ctx.run_id)
        project = ProjectContext(root, self.runtime.database.parent / "project-context")
        await project.refresh()
        services = [
            policy, HandleDeferredToolCalls(handler=policy.handle),
            AskUser(answerer=self.runtime.broker.ask),
            RunBoundary(self.runtime, root, project, child),
        ]
        if not policy.role_read_only:
            services.append(Planning(tools=["write_plan"], store=store))
        if self.role == "super":
            registry = MCPRegistry(self.runtime.mcp_path)
            registry.authorize_stdio = policy.authorize_stdio
            services.append(RunMCP(registry))
        return CombinedCapability(services)


class RunBoundary(AbstractCapability):
    def __init__(self, runtime, root, project, child):
        self.runtime = runtime
        self.root = root
        self.project = project
        self.child = child

    def get_instructions(self):
        return self.project.instructions

    async def wrap_run(self, ctx, *, handler):
        record = self.runtime.owner.records.get(self.child)
        # A clone is inside its parent's workspace lease; acquiring it again would deadlock.
        independent = record is not None and record.parent_id is None and record.agent_name != "self"
        lease = nullcontext()
        if independent and not BORROWED_WORKSPACE_LEASE.get():
            lease = execution_lock(self.runtime.database, ctx.conversation_id, self.root)
        with lease:
            return await handler()
