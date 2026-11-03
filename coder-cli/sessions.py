import asyncio
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path
import sqlite3

from pydantic_ai.messages import ModelMessage, UserPromptPart
from pydantic_ai_harness.conversation_search import SnapshotHistorySource
from pydantic_ai_harness.step_persistence import SqliteStepStore

SESSION_DATABASE = Path(__file__).resolve().parent / "workspace" / "sessions.db"


def session_database() -> Path:
    return SESSION_DATABASE


async def session_workspace(database: Path, session_id: str | None, path: str | None) -> Path:
    if session_id is not None:
        path = None
    saved = None
    if session_id and database.exists():
        store = SqliteStepStore(database=str(database))
        runs = [run for run in await store.list_runs(conversation_id=session_id) if run.parent_run_id is None]
        for run in reversed(runs):
            if "workspace" in run.metadata:
                value = run.metadata["workspace"]
                if not isinstance(value, str) or not value or not Path(value).is_absolute():
                    raise ValueError(f"会话 {session_id} 的工作目录记录无效")
                saved = Path(value).resolve()
                break
        if runs and saved is None:
            # 旧会话的工具一直在数据库所在的 workspace 目录执行。
            saved = database.parent.resolve()
    if path is not None and not path.strip():
        raise ValueError("--path 不能为空")
    requested = Path(path).expanduser().resolve() if path is not None else None
    workspace = saved or requested or Path.cwd().resolve()
    if not workspace.is_dir():
        raise ValueError(f"工作目录不存在或不是目录：{workspace}")
    return workspace


@dataclass(frozen=True)
class SessionInfo:
    session_id: str
    title: str


def session_title(text: str) -> str:
    return " ".join("".join(c for c in text if c.isprintable() or c.isspace()).split())[:80]


async def list_sessions(database: Path) -> list[SessionInfo]:
    if not database.exists():
        return []
    store = SqliteStepStore(database=str(database))
    source = SnapshotHistorySource(store)
    sessions: dict[str, SessionInfo] = {}
    for run in await store.list_runs():
        session_id = run.conversation_id
        if not session_id or run.parent_run_id is not None:
            continue
        title = session_title(run.metadata.get("title", ""))
        previous = sessions.pop(session_id, None)
        if not title and previous is not None:
            title = previous.title
        if not title:
            messages = await source.run_history(run_id=run.run_id)
            if not messages:
                snapshot = await store.latest_snapshot(run_id=run.run_id, include_interrupted=True)
                messages = snapshot.messages if snapshot else []
            for message in messages:
                for part in message.parts:
                    if isinstance(part, UserPromptPart) and isinstance(part.content, str):
                        title = session_title(part.content)
                        if title:
                            break
                if title:
                    break
        sessions[session_id] = SessionInfo(session_id, title)
    return [SessionInfo(s.session_id, s.title or "Untitled session") for s in reversed(sessions.values())]


async def load_session_history(database: Path, session_id: str) -> list[ModelMessage]:
    if not database.exists():
        return []
    run_id = await asyncio.to_thread(_latest_successful_run, database, session_id)
    if run_id is None:
        return []
    store = SqliteStepStore(database=str(database))
    snapshot = await store.latest_snapshot(run_id=run_id)
    if snapshot is None:
        raise ValueError(f"会话 {session_id} 的成功轮次缺少消息快照，无法恢复")
    return snapshot.messages


def _latest_successful_run(database: Path, session_id: str) -> str | None:
    with closing(sqlite3.connect(database.resolve().as_uri() + "?mode=rw", uri=True)) as connection:
        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_runs_top_conversation_started
            ON runs(conversation_id, started_at)
            WHERE parent_run_id IS NULL
            """
        )
        row = connection.execute(
            """
            SELECT r.run_id FROM runs AS r
            WHERE r.conversation_id = ? AND r.parent_run_id IS NULL
              AND EXISTS (
                  SELECT 1 FROM events AS e
                  WHERE e.run_id = r.run_id AND e.kind = 'run_completed'
              )
            ORDER BY r.started_at DESC, r.rowid DESC
            LIMIT 1
            """,
            (session_id,),
        ).fetchone()
    return row[0] if row is not None else None
