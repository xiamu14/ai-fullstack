"""Native Permissions with project-wide checks and exact-call approval tickets."""
import asyncio
from contextvars import ContextVar
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import os
from pathlib import Path

from pydantic_ai.exceptions import ApprovalRequired, SkipToolExecution
from pydantic_ai.tools import ToolApproved, ToolDenied
from pydantic_ai_harness.permissions import Permissions

from agent.permissions.config import config_path, digest, load_settings, redact
from agent.permissions.rules import Decision, decide


CURRENT_GRANT: ContextVar[Decision | None] = ContextVar("coder_execution_grant", default=None)


@dataclass(frozen=True)
class Pending:
    decision: Decision
    fingerprint: str
    arguments: dict


class ExecutionPermissions(Permissions):
    id = "execution_permissions"

    def __init__(self, root: Path, interaction, database: Path, mcp_path: Path):
        super().__init__("read-only")
        self.root = root.resolve()
        self.interaction = interaction
        self.path = config_path()
        self.settings, _ = load_settings(self.path)
        self.mcp_path = mcp_path
        self.libraries = (Path(__file__).resolve().parents[2] / "skills", Path.home() / ".agents/skills")
        self.refresh_readonly()
        self.forbidden = tuple(path.resolve() for path in (
            self.path, database, Path(str(database) + "-wal"), Path(str(database) + "-shm"),
            database.parent / "permissions.jsonl", database.parent / "execution-locks",
            Path.home() / ".ssh", Path.home() / ".aws",
        ))
        if not self.root.is_relative_to(database.parent.resolve()):
            self.forbidden += (database.parent.resolve(),)
        self.pending: dict[tuple[str, str], Pending] = {}
        self.known_calls = {}
        self.tickets: dict[tuple[str, str], tuple[str, bool]] = {}
        self.grants: set[tuple[str, str]] = set()
        self.lock = asyncio.Lock()
        self.audit_path = database.parent / "permissions.jsonl"

    def refresh_readonly(self):
        roots = [path.resolve() for path in self.libraries]
        for library in self.libraries:
            if library.is_dir():
                roots.extend(path.resolve() for path in library.iterdir() if (path / "SKILL.md").is_file())
        self.readonly = tuple(roots)

    def evaluate(self, name, tool_def, args):
        settings, version = load_settings(self.path)
        metadata = tool_def.metadata or {}
        command_arg = metadata.get("code_arg_name") if metadata.get("code_arg_language") == "shell" else None
        decision = decide(settings, name, tool_def.tool_kind, args, root=self.root, readonly=self.readonly,
                          forbidden=self.forbidden, command_arg=command_arg)
        try:
            mcp_version = digest(self.mcp_path.read_bytes().hex())
        except FileNotFoundError:
            mcp_version = "missing"
        target_state = None
        if decision.target is not None:
            try:
                info = decision.target.stat()
                target_state = [info.st_ino, info.st_mtime_ns, info.st_ctime_ns, info.st_size]
            except FileNotFoundError:
                pass
        fingerprint = digest([version, mcp_version, str(self.root), name, args, str(decision.target), target_state])
        return decision, fingerprint

    def record(self, ctx, call, action, fingerprint, reason, *, tool_name=None):
        self.audit_path.parent.mkdir(parents=True, exist_ok=True)
        entry = {
            "at": datetime.now(timezone.utc).isoformat(),
            "conversation_id": getattr(ctx, "conversation_id", None), "run_id": getattr(ctx, "run_id", None),
            "tool_call_id": getattr(call, "tool_call_id", None), "tool": tool_name or call.tool_name,
            "action": action, "fingerprint": fingerprint, "reason": reason,
        }
        fd = os.open(self.audit_path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o600)
        with os.fdopen(fd, "a", encoding="utf-8") as file:
            os.fchmod(file.fileno(), 0o600)
            file.write(json.dumps(entry, ensure_ascii=False) + "\n")

    async def before_tool_execute(self, ctx, *, call, tool_def, args):
        decision, fingerprint = self.evaluate(call.tool_name, tool_def, args)
        key = (ctx.run_id, call.tool_call_id)
        if decision.action == "deny":
            self.record(ctx, call, "deny", fingerprint, decision.reason)
            raise SkipToolExecution("权限拒绝：" + decision.reason)
        if ctx.tool_call_approved:
            ticket = self.tickets.pop(key, None)
            if ticket is None or ticket[0] != fingerprint:
                self.record(ctx, call, "deny", fingerprint, "批准后调用、目标或策略发生变化")
                raise SkipToolExecution("批准已失效：调用、目标或权限配置发生变化，请重新发起。")
            if ticket[1] and not decision.forced:
                self.grants.add((ctx.conversation_id, fingerprint))
            self.record(ctx, call, "execute_approved", fingerprint, decision.reason)
            return args
        if decision.action == "allow":
            self.record(ctx, call, "allow", fingerprint, decision.reason)
            return args
        if not decision.forced and (ctx.conversation_id, fingerprint) in self.grants:
            self.record(ctx, call, "allow_remembered", fingerprint, decision.reason)
            return args
        self.pending[key] = Pending(decision, fingerprint, dict(args))
        self.record(ctx, call, "ask", fingerprint, decision.reason)
        try:
            await super().before_tool_execute(ctx, call=call, tool_def=tool_def, args=args)
        except ApprovalRequired:
            raise
        raise ApprovalRequired(metadata={"coder_permission": {"reason": decision.reason, "fingerprint": fingerprint}})

    async def before_tool_validate(self, ctx, *, call, tool_def, args):
        self.known_calls[(ctx.run_id, call.tool_call_id)] = tool_def
        return args

    async def handle(self, ctx, requests):
        approvals = {}
        for call in requests.approvals:
            key = (ctx.run_id, call.tool_call_id)
            pending = self.pending.pop(key, None)
            definition = self.known_calls.get(key)
            if pending is None and definition is not None:
                arguments = call.args_as_dict()
                decision, fingerprint = self.evaluate(call.tool_name, definition, arguments)
                if decision.action != "deny":
                    pending = Pending(decision, fingerprint, arguments)
            if pending is None:
                approvals[call.tool_call_id] = ToolDenied("缺少受信任的审批上下文，未执行。")
                continue
            decision = pending.decision
            rememberable = decision.action == "ask" and not decision.forced and not decision.command and not decision.write
            details = f"工具：{call.tool_name}\n工作目录：{self.root}\n原因：{decision.reason}\n参数：\n{redact(pending.arguments)}"
            if decision.command:
                details += "\n批准仅限这条命令；可联网，但不能访问权限配置、凭据目录或任意外部文件。"
                details += "以 git 启动的命令可更新当前项目的 Git 元数据。"
            approved, remember = await self.interaction.approve(details, rememberable=rememberable)
            self.record(ctx, call, "approved" if approved else "denied", pending.fingerprint, decision.reason)
            if approved:
                self.tickets[key] = (pending.fingerprint, remember and rememberable)
                approvals[call.tool_call_id] = ToolApproved()
            else:
                approvals[call.tool_call_id] = ToolDenied("用户未明确批准，本次调用未执行。")
        return requests.build_results(approvals=approvals)

    async def authorize_stdio(self, name, server, cwd, stack):
        from fnmatch import fnmatchcase
        from agent.permissions.workspace import RestrictedBackend
        settings, version = load_settings(self.path)
        if settings.sandbox:
            import shutil
            import sys
            if sys.platform != "darwin" or shutil.which("sandbox-exec") is None:
                raise PermissionError("本地 MCP 隔离后端不可用，拒绝启动")
        identifier = f"mcp.start.{name}"
        subject = json.dumps([server.command, *server.args], ensure_ascii=False)
        try:
            config_bytes = self.mcp_path.read_bytes()
        except FileNotFoundError:
            config_bytes = b""
        fingerprint = digest([version, config_bytes.hex(), server.model_dump(), str(cwd), cwd.stat().st_ino])
        reason = "启动本地 MCP 子进程"
        if any(rule.action == "deny" and fnmatchcase(identifier, rule.tool) and fnmatchcase(subject, rule.pattern)
               for rule in settings.rules):
            self.record(self.interaction.context, None, "deny_start", fingerprint, reason, tool_name=identifier)
            raise PermissionError(f"拒绝启动 stdio MCP：{name}")
        if settings.mode != "full":
            self.record(self.interaction.context, None, "ask_start", fingerprint, reason, tool_name=identifier)
            approved, _ = await self.interaction.approve(
                f"启动本地 MCP：{name}\n工作目录：{cwd}\n命令与参数：{redact([server.command, *server.args])}"
                "\n启动即执行程序，并允许 TCP 网络；不向其开放权限配置和凭据目录。",
                rememberable=False,
            )
            if not approved:
                self.record(self.interaction.context, None, "denied_start", fingerprint, reason, tool_name=identifier)
                raise PermissionError(f"未批准启动 stdio MCP：{name}")
        _, new_version = load_settings(self.path)
        try:
            new_bytes = self.mcp_path.read_bytes()
        except FileNotFoundError:
            new_bytes = b""
        if digest([new_version, new_bytes.hex(), server.model_dump(), str(cwd), cwd.stat().st_ino]) != fingerprint:
            raise PermissionError("MCP 启动批准失效：配置或工作目录发生变化")
        self.record(self.interaction.context, None, "start", fingerprint, reason, tool_name=identifier)
        if not settings.sandbox:
            return os.path.expanduser(server.command), server.args, {}
        backend = RestrictedBackend(cwd, self)
        stack.callback(backend.close)
        return "/usr/bin/sandbox-exec", ["-p", backend.profile(network=True), os.path.expanduser(server.command), *server.args], {
            "TMPDIR": str(backend.scratch), "UV_CACHE_DIR": str(backend.scratch / "uv-cache"),
        }

    async def wrap_tool_execute(self, ctx, *, call, tool_def, args, handler):
        # Serial execution makes approval and target rechecks precede every side effect.
        async with self.lock:
            decision, _ = self.evaluate(call.tool_name, tool_def, args)
            token = CURRENT_GRANT.set(decision)
            try:
                return await handler(args)
            finally:
                CURRENT_GRANT.reset(token)

    async def wrap_run(self, ctx, *, handler):
        try:
            return await handler()
        finally:
            for mapping in (self.pending, self.tickets, self.known_calls):
                for key in list(mapping):
                    if key[0] == ctx.run_id:
                        del mapping[key]
