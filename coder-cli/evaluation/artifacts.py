"""Private benchmark artifacts and reproducible version fingerprints."""

import hashlib
import json
import os
from pathlib import Path
import subprocess

from pydantic_core import to_jsonable_python

BENCHMARK_DIR = Path(__file__).resolve().parents[2] / "benchmark" / "gaia"


def json_text(value, *, indent=None) -> str:
    text = json.dumps(to_jsonable_python(value, bytes_mode="base64"), ensure_ascii=False, indent=indent)
    for key, secret in os.environ.items():
        if len(secret) >= 8 and any(word in key.upper() for word in ("TOKEN", "SECRET", "PASSWORD", "API_KEY")):
            text = text.replace(json.dumps(secret, ensure_ascii=False)[1:-1], "[REDACTED]")
    return text


def write_json(path: Path, value) -> None:
    text = json_text(value, indent=2)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(text + "\n", encoding="utf-8")
    temporary.replace(path)


def fingerprint(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def source_version(root: Path) -> dict:
    paths = [*sorted((root / "evaluation").glob("*.py")), root / "evaluation/gaia_text_subset.json",
             root / "tools/web_tools.py", root / "integrations/provider.py", root / "provider.jsonc", root / "uv.lock"]
    hashes = {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest() for path in paths}
    git = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, text=True, capture_output=True, check=False)
    dirty = subprocess.run(["git", "status", "--porcelain", "--", *hashes], cwd=root,
                           text=True, capture_output=True, check=False)
    agent_files = {key: value for key, value in hashes.items() if key in {
        "evaluation/gaia.py", "tools/web_tools.py", "integrations/provider.py", "provider.jsonc", "uv.lock"}}
    return {"agent_sha256": fingerprint(agent_files), "dirty": bool(dirty.stdout.strip()) if dirty.returncode == 0 else None,
            "git_commit": git.stdout.strip() if git.returncode == 0 else None,
            "source_sha256": fingerprint(hashes), "files": hashes}
