from dataclasses import dataclass
from pathlib import Path

from pydantic_ai.messages import ModelMessage, UserPromptPart
from pydantic_ai_harness.conversation_search import SnapshotHistorySource
from pydantic_ai_harness.step_persistence import SqliteStepStore


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
    store = SqliteStepStore(database=str(database))
    for run in reversed(await store.list_runs(conversation_id=session_id)):
        if run.parent_run_id is not None:
            continue
        events = await store.list_events(run_id=run.run_id)
        if not any(event.kind == "run_completed" for event in events):
            continue
        snapshot = await store.latest_snapshot(run_id=run.run_id)
        if snapshot is None:
            raise ValueError(f"会话 {session_id} 的成功轮次缺少消息快照，无法恢复")
        return snapshot.messages
    return []
