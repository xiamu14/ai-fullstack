"""macOS process sandbox plus file-backend checks; never silently falls back."""
import json
from fnmatch import translate
import re
import os
from pathlib import Path
import shutil
import shlex
import stat
import sys
import tempfile
import weakref

from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai.workspaces import LocalWorkspaceBackend

from agent.permissions.policy import CURRENT_GRANT


class RestrictedBackend(LocalWorkspaceBackend):
    def __init__(self, root: Path, policy):
        self.root = root
        self.policy = policy
        self.temporary = tempfile.TemporaryDirectory(prefix="coder-exec-")
        weakref.finalize(self, self.temporary.cleanup)
        self.scratch = Path(self.temporary.name).resolve()
        super().__init__(root, env={"TMPDIR": str(self.scratch), "UV_CACHE_DIR": str(self.scratch / "uv-cache")})

    def close(self):
        self.temporary.cleanup()

    def check(self, path: str, *, write=False):
        target = Path(path).resolve()
        if any(target == denied or target.is_relative_to(denied) for denied in self.policy.forbidden):
            raise PermissionError("工具不能访问权限配置、凭据目录或运行存储")
        grant = CURRENT_GRANT.get()
        if grant and grant.target == target and (not write or grant.write):
            return
        if target.is_relative_to(self.scratch):
            return
        if target.is_relative_to(self.root):
            from fnmatch import fnmatchcase
            settings, _ = self.policy_settings()
            relative = target.relative_to(self.root).as_posix()
            if any(fnmatchcase(relative, pattern) or fnmatchcase(target.name, pattern)
                   for pattern in settings.protected_paths):
                raise PermissionError("受保护资源缺少本次调用授权")
            return
        if not write and any(target.is_relative_to(root) for root in self.policy.readonly):
            return
        raise PermissionError("工作目录之外的文件缺少本次调用授权")

    def policy_settings(self):
        from agent.permissions.config import load_settings
        return load_settings(self.policy.path)

    async def read_bytes(self, path):
        self.check(path)
        return await super().read_bytes(path)

    async def write_bytes(self, path, data):
        self.check(path, write=True)
        target = Path(path).resolve()
        def write():
            self.check(str(target), write=True)
            mode = target.stat().st_mode if target.exists() else stat.S_IFREG | 0o600
            if not stat.S_ISREG(mode):
                raise OSError("不能写入非普通文件")
            target.parent.mkdir(parents=True, exist_ok=True)
            fd, name = tempfile.mkstemp(dir=target.parent)
            try:
                with os.fdopen(fd, "wb") as file:
                    file.write(data)
                    file.flush()
                    os.fsync(file.fileno())
                    os.fchmod(file.fileno(), stat.S_IMODE(mode))
                os.replace(name, target)
            finally:
                Path(name).unlink(missing_ok=True)
        import asyncio
        return await asyncio.to_thread(write)

    async def list_dir(self, path):
        self.check(path)
        return await super().list_dir(path)

    async def stat(self, path):
        # FileSystem checks the parent directory of an individually approved external file.
        target = Path(path).resolve()
        if any(target == denied or target.is_relative_to(denied) for denied in self.policy.forbidden):
            raise PermissionError("禁止访问受信任配置或运行存储")
        return await super().stat(path)

    async def make_dir(self, path):
        self.check(path, write=True)
        return await super().make_dir(path)

    async def remove(self, path):
        self.check(path, write=True)
        return await super().remove(path)

    async def exists(self, path):
        self.check(path)
        return await super().exists(path)

    def profile(self, *, network=False, git_write=False):
        def subpath(path):
            return f"(subpath {json.dumps(str(Path(path).resolve()))})"
        read = ["/System", "/usr", "/bin", "/sbin", "/opt/homebrew", "/Library", "/private/etc",
                Path(sys.prefix), Path.home() / ".local/share/uv", self.root, self.scratch, *self.policy.readonly]
        if git_write:
            read.extend(["/Applications/Xcode.app/Contents/Developer", Path.home() / ".gitconfig", Path.home() / ".config/git"])
        read_filters = " ".join(subpath(path) for path in [*read, "/dev"])
        lines = [
            "(version 1)", "(allow default)",
            f'(deny file-read-data (require-not (require-any (literal "/") {read_filters})))',
            f'(deny file-write* (require-not (require-any {subpath(self.root)} {subpath(self.scratch)} (literal "/dev/null"))))',
            "(deny network-outbound (remote unix-socket))" if network else "(deny network*)",
        ]
        for path in self.policy.forbidden:
            lines.append(f"(deny file-read-data file-write* {subpath(path)})")
        # Apply the same configured protected globs to child processes.
        settings, _ = self.policy_settings()
        for pattern in settings.protected_paths:
            if git_write and pattern in {".git", ".git/**"}:
                continue
            expression = translate(pattern)[4:-3].replace("(?>", "(").replace("(?:", "(")
            prefix = "^" + re.escape(str(self.root)) + "/"
            if "/" not in pattern:
                prefix += "(.*/)?"
            expression = prefix + "(" + expression + ")(/|$)"
            expression = expression.replace('"', chr(92) + '"')
            lines.append(f'(deny file-read-data file-write* (regex #"{expression}"))')
        return "\n".join(lines)

    async def run(self, command, *, shell=False, env=None, timeout=None):
        if isinstance(command, str) and not shell:
            raise TypeError("字符串命令必须指定 shell=True")
        if not isinstance(command, str) and shell:
            raise TypeError("argv 命令不能指定 shell=True")
        settings, _ = self.policy_settings()
        if not settings.sandbox:
            return await super().run(command, shell=shell, env=env, timeout=timeout)
        if sys.platform != "darwin" or shutil.which("sandbox-exec") is None:
            raise OSError("本机执行隔离不可用；拒绝执行。请配置可用的隔离后端。")
        grant = CURRENT_GRANT.get()
        try:
            words = shlex.split(grant.subject) if grant and grant.command else []
        except ValueError:
            words = []
        git_write = bool(words and Path(words[0]).name == "git")
        if git_write:
            # Resolve Apple's launcher before sandboxing; its SDK cache ignores TMPDIR.
            located = await super().run(["/usr/bin/xcrun", "--find", "git"], timeout=5)
            if located.exit_code != 0:
                raise OSError("无法定位系统 Git，拒绝运行")
            git_bin = Path(located.stdout.strip()).parent
            env = {**(env or {}), "PATH": f"{git_bin}:{os.environ.get('PATH', os.defpath)}"}
        argv = ["/bin/sh", "-c", command] if isinstance(command, str) else list(command)
        invocation = ["/usr/bin/sandbox-exec", "-p", self.profile(network=bool(grant and grant.command), git_write=git_write), *argv]
        return await super().run(invocation, env=env, timeout=timeout)


class RestrictedWorkspace(LocalWorkspace):
    def __init__(self, root: Path, policy):
        super().__init__(root)
        self.policy = policy

    def get_workspace(self, ctx, *, ref):
        self.policy.refresh_readonly()
        backend = RestrictedBackend(Path(self.working_dir), self.policy)
        if ref is not None and ref != backend.ref:
            shutil.rmtree(backend.scratch)
            return None
        return backend
