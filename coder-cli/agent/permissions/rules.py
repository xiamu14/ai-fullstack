"""Deny first, protected resources second, explicit rules third, ask by default."""
from dataclasses import dataclass
from fnmatch import fnmatchcase
from pathlib import Path

from agent.permissions.config import Settings


INTERNAL = frozenset({
    "write_plan",
    "ask_user_question", "load_capability", "search_tools", "search_conversation_history",
    "read_memory", "write_memory", "search_memory", "delete_memory",
})


@dataclass(frozen=True)
class Decision:
    action: str
    reason: str
    subject: str
    target: Path | None = None
    write: bool = False
    command: bool = False
    forced: bool = False


def decide(settings: Settings, name: str, kind: str | None, args: dict, *, root: Path,
           readonly: tuple[Path, ...], forbidden: tuple[Path, ...], command_arg: str | None) -> Decision:
    command = command_arg is not None
    file_tool = bool(kind and kind.startswith("file_system."))
    write = bool(kind and kind.rsplit(".", 1)[-1] in {"write_file", "edit_file", "create_directory"})
    target = (root / args.get("path", ".")).resolve() if file_tool else None
    subject = str(args[command_arg]) if command else str(target) if target else name

    def result(action, reason, forced=False):
        return Decision(action, reason, subject, target, write, command, forced)

    if target and any(target == path or target.is_relative_to(path) for path in forbidden):
        return result("deny", "权限配置、凭据目录和运行存储不允许工具访问", True)
    def matches_rule(rule):
        if rule.argument is None:
            resource = subject
        elif rule.argument == "path" and target:
            resource = str(target)
        elif rule.argument in args:
            resource = str(args[rule.argument])
        else:
            return False
        return fnmatchcase(name, rule.tool) and fnmatchcase(resource, rule.pattern)
    matches = [rule for rule in settings.rules if matches_rule(rule)]
    if any(rule.action == "deny" for rule in matches):
        return result("deny", "命中拒绝规则", True)
    if target:
        relative = target.relative_to(root).as_posix() if target.is_relative_to(root) else str(target)
        if any(fnmatchcase(relative, pattern) or fnmatchcase(target.name, pattern) for pattern in settings.protected_paths):
            return result("ask", "受保护资源需逐次确认", True)
        if not target.is_relative_to(root):
            if not write and any(target.is_relative_to(path) for path in readonly):
                return result("allow", "只读技能资源")
            return result("ask", "访问工作目录之外的资源需逐次确认", True)
    if any(rule.action == "ask" for rule in matches):
        return result("ask", "命中确认规则", not all(rule.remember for rule in matches if rule.action == "ask"))
    if settings.mode == "read-only" and (write or command):
        return result("ask", "read-only 模式确认写入与命令")
    if any(rule.action == "allow" for rule in matches):
        return result("allow", "命中明确放行规则")
    if file_tool:
        return result("allow", "工作目录内普通文件操作")
    if name in INTERNAL:
        return result("allow", "框架问答、发现与会话记忆工具")
    if settings.mode == "full":
        return result("allow", "full 模式；硬限制仍生效")
    return result("ask", "命令、外部工具或未分类操作默认询问", True)
