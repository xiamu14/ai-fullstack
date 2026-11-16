"""Native managed delegations plus project-specific role/worktree boundaries."""
import asyncio
import json
import time
from contextlib import AsyncExitStack
from pathlib import Path
from hashlib import sha256
from dataclasses import replace

from pydantic_ai import RunContext, UsageLimits
from pydantic_ai.capabilities import AbstractCapability
from pydantic_ai.exceptions import ModelRetry, SkipToolExecution
from pydantic_ai.usage import RunUsage
from pydantic_ai.workspaces import Workspace
from pydantic_ai_harness.subagents import (
    DelegationReports, DelegationTasks, SubAgents, TaskControl,
)

from agent.interaction import Interaction
from agent.permissions.policy import ExecutionPermissions
from agent.permissions.workspace import RestrictedBackend
from agent.roles import ROLES
from storage.worktrees import Worktrees, git
from storage.delegations import delegation_directory
from storage.execution_lock import delegation_lease
from tools.external_hooks import hook_config_path


class RoleTaskOwner(DelegationTasks):
    def reports(self, *, conversation_id: str, parent_id: str | None = None):
        if parent_id is None:
            return []
        return super().reports(conversation_id=conversation_id, parent_id=parent_id)

    def super_reports(self, conversation_id: str):
        return super().reports(conversation_id=conversation_id)


class Delegations:
    def __init__(self, database, workspace, conversation_id):
        self.database = database
        self.workspace = workspace
        self.conversation_id = conversation_id
        directory = database.parent / "worktrees"
        if directory.resolve().is_relative_to(workspace.resolve()):
            key = sha256(str(database.resolve()).encode()).hexdigest()[:16]
            directory = Path.home() / ".cache" / "coder-cli" / "worktrees" / key
        self.worktrees = Worktrees(directory / sha256(conversation_id.encode()).hexdigest(), workspace)
        self.owner = None
        self.stack = None
        self.observer = None
        self.broker = Interaction()
        self.agents = {}
        self.backends = []
        self.write_locks = {}

    async def open(self, store, *, observer=None, on_question=None):
        if observer is not None:
            self.observer = observer
        if on_question is not None and (self.stack is None or observer is not None):
            self.broker.on_question = on_question
        if self.stack is not None:
            return
        self.broker.active = True
        self.owner = RoleTaskOwner(
            directory=delegation_directory(self.database, self.conversation_id),
            step_store=store, observer=self.observe, max_depth=3,
        )
        stack = AsyncExitStack()
        opened = False
        try:
            if observer is not None:
                stack.enter_context(delegation_lease(self.database, self.conversation_id))
            await stack.enter_async_context(self.owner.opened())
            self.stack = stack
            opened = True
        finally:
            if not opened:
                await stack.aclose()

    async def observe(self, event):
        if self.observer is not None:
            await self.observer(event)

    async def close(self):
        if self.stack is not None:
            await self.stack.aclose()
            self.stack = None
        for backend in self.backends:
            backend.close()
        self.backends.clear()
        self.broker.close()

    def write_lock(self, directory):
        return self.write_locks.setdefault(directory, asyncio.Lock())

    def role_permissions(self, directory, name):
        role = ROLES[name]
        policy = ExecutionPermissions(directory, self.broker, self.database, self.mcp_path,
                                      policy_id=role.policy_id)
        if name != "super":
            policy.libraries = tuple(Path(__file__).resolve().parents[1] / path for path in role.skills)
            policy.refresh_readonly()
        hook_path = hook_config_path()
        if hook_path is not None:
            policy.forbidden += (hook_path,)
        return policy

    async def resolve_workspace(self, ctx, request):
        if request.directory == str(self.workspace):
            directory = self.workspace
        else:
            record = await asyncio.to_thread(self.worktrees.validate, request.directory)
            directory = Path(record.path)
        policy = self.role_permissions(directory, request.agent_name)
        backend = RestrictedBackend(directory, policy)
        self.backends.append(backend)
        return Workspace(backend)

    async def start_role(self, conversation, role, task, *, source_id=None):
        if self.owner is None:
            raise RuntimeError("委派会话未打开")
        source = self.owner.records.get(source_id) if source_id else None
        if source_id and source is None:
            raise ValueError("找不到指定的原生任务 ID。")
        if source is not None and (source.status != "finished" or source.outcome != "ok"):
            raise ValueError("来源任务尚未成功交付。")
        if source is not None:
            task += f"\n\n来源任务 {source.id}，run_id {source.run_id}\n{source.output}"
        revision = "HEAD"
        if source is not None and source.working_directory and source.working_directory != str(self.workspace):
            origin = await asyncio.to_thread(self.worktrees.validate, source.working_directory)
            if await asyncio.to_thread(git, Path(origin.path), "status", "--porcelain"):
                raise ValueError("来源 worktree 仍有未提交修改；请先明确提交检查点再交接。")
            revision = await asyncio.to_thread(git, Path(origin.path), "rev-parse", "HEAD")
        directory, task = await self.role_workspace(f"explicit:{role}:{time.time_ns()}", task, revision=revision)
        # Use the public native toolset for explicit role requests as well as model delegation.
        toolset = SubAgents(
            agents=list(self.agents.values()), workspace_resolver=self.resolve_workspace,
            task_control=TaskControl(max_running_tasks=4),
        ).get_toolset()
        policy = conversation.permissions
        backend = RestrictedBackend(self.workspace, policy)
        self.backends.append(backend)
        ctx = RunContext(
            deps=None, model=conversation.agent.model, usage=RunUsage(), messages=[],
            conversation_id=self.conversation_id, agent=conversation.agent,
            workspace=Workspace(backend), usage_limits=UsageLimits(request_limit=50),
        )
        with self.owner.bind():
            return await toolset.delegate_task(
                ctx, role, task, background=True, working_directory=directory,
            )

    async def role_workspace(self, key, task, *, revision="HEAD", previous=None):
        if previous == str(self.workspace) or (previous is None and revision == "HEAD"
                                               and not (self.workspace / ".git").exists()):
            return str(self.workspace), f"共享工作目录 {self.workspace}\n{task}"
        if previous is not None:
            record = await asyncio.to_thread(self.worktrees.validate, previous)
        else:
            record = await self.worktrees.allocate(key, revision)
        return record.path, f"基线 {record.baseline}\n工作区 {record.path}\n{task}"

    def reports(self):
        return DelegationReports(self.owner, conversation_id=self.conversation_id)


class DelegationPolicy(AbstractCapability):
    def __init__(self, runtime, role):
        self.runtime = runtime
        self.role = role

    async def prepare_tools(self, ctx, tool_defs):
        allowed = ROLES[self.role].allowed_tools
        tools = tool_defs if allowed is None else [tool for tool in tool_defs if tool.name in allowed]
        if self.role == "super" and DelegationTasks.child_id() is None:
            tools = [replace(tool, sequential=True) if tool.name == "delegate_task" else tool for tool in tools]
        if self.role == "super" and DelegationTasks.child_id() is not None:
            result = []
            for tool in tools:
                if tool.name == "delegate_task":
                    schema = tool.parameters_json_schema
                    properties = dict(schema["properties"])
                    properties["agent_name"] = {**properties["agent_name"], "enum": ["self"]}
                    tool = replace(tool, parameters_json_schema={**schema, "properties": properties})
                result.append(tool)
            return result
        return tools

    async def before_tool_validate(self, ctx, *, call, tool_def, args):
        allowed = ROLES[self.role].allowed_tools
        if allowed is not None and call.tool_name not in allowed:
            raise SkipToolExecution("当前角色未绑定此工具。")
        if call.tool_name != "delegate_task":
            return args
        try:
            args = json.loads(args) if isinstance(args, str) else args
        except json.JSONDecodeError as exc:
            raise ModelRetry("委派参数必须是 JSON 对象。") from exc
        if not isinstance(args, dict):
            raise ModelRetry("委派参数必须是 JSON 对象。")
        args = dict(args)
        if not isinstance(args.get("task"), str) or not args["task"].strip():
            raise ModelRetry("委派任务必须是非空文本。")
        name = args.get("agent_name")
        child = DelegationTasks.child_id()
        if name != "self" and (self.role != "super" or child is not None):
            raise ModelRetry("分身只能委派 self；跨角色任务由 Super 主运行调度。")
        if name == "self":
            if args.get("working_directory"):
                raise ModelRetry("同角色分身必须复用父工作区。")
            if not ROLES[self.role].read_only and args.get("background"):
                raise ModelRetry("写入角色分身必须前台串行执行。")
            return args
        if name not in self.runtime.agents:
            raise ModelRetry("未知内置角色")
        owner = self.runtime.owner
        previous = owner.records.get(args.get("resume"))
        args["working_directory"], args["task"] = await self.runtime.role_workspace(
            f"{ctx.run_id}:{call.tool_call_id}", args["task"],
            previous=previous.working_directory if previous else None,
        )
        if args["working_directory"] == str(self.runtime.workspace):
            args["background"] = False
        return args

    async def wrap_tool_execute(self, ctx, *, call, tool_def, args, handler):
        child_id = DelegationTasks.child_id()
        record = self.runtime.owner.records.get(child_id)
        clone = record is not None and record.agent_name == "self"
        directory = await ctx.workspace.working_dir()
        if call.tool_name == "delegate_task" and args.get("agent_name") == "self" and not ROLES[self.role].read_only:
            if clone:
                raise SkipToolExecution("写入分身首版不再嵌套委派。")
            async with self.runtime.write_lock(directory):
                return await handler(args)
        side_effect = (call.tool_name == "write_plan" or
                       tool_def.tool_kind in {"file_system.write_file", "file_system.edit_file", "file_system.create_directory"}
                       or (tool_def.metadata or {}).get("code_arg_language") == "shell")
        if not clone and not ROLES[self.role].read_only and side_effect:
            async with self.runtime.write_lock(directory):
                return await handler(args)
        return await handler(args)
