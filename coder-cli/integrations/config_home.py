"""Resolve the shared user configuration directory."""
import os
from pathlib import Path


def config_home() -> Path:
    parent = Path.home() / ".config"
    target = parent / ".ani bot"
    sources = [parent / name for name in (".coder-cli", "coder-cli")]
    sources = [source for source in sources if source.exists() or source.is_symlink()]
    if not sources:
        return target
    if len(sources) != 1 or target.exists() or target.is_symlink():
        raise FileExistsError("配置目录冲突，无法迁移到 ~/.config/.ani bot")
    source = sources[0]
    if source.is_symlink() or not source.is_dir():
        raise ValueError("旧配置路径必须是实际目录")
    try:
        source.rename(target)
    except FileNotFoundError:
        if not target.is_dir():
            raise
    return target


def user_config(variable: str, filename: str) -> Path:
    override = os.getenv(variable)
    return (Path(override).expanduser() if override is not None else config_home() / filename).resolve()
