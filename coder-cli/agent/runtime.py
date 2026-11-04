import os
from functools import partial
from pathlib import Path

import logfire
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai.conversation import Conversation as NativeConversation
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai_harness import (
    AskUser,
    ConversationSearch,
    Memory,
    Skills,
    StepPersistence,
    SummarizingCompaction,
)
from pydantic_ai_harness.coder import Coder
from pydantic_ai_harness.conversation_search import SnapshotHistorySource
from pydantic_ai_harness.memory import FileStore
from pydantic_ai_harness.step_persistence import SqliteStepStore

from agent.conversation import Conversation
from agent.interaction import Interaction
from context.project import ProjectContext
from integrations.mcp import MCPRegistry
from storage.sessions import (
    load_session_history,
    save_session,
    session_database,
    session_workspace,
)
from tools.web_tools import web_fetch


async def create_agent(session_id: str | None = None, path: str | None = None) -> Conversation:
    load_dotenv()
    if not all((os.getenv("MODEL_NAME"), os.getenv("OPENAI_BASE_URL"), os.getenv("OPENAI_API_KEY"))):
        raise ValueError("请在 .env 配置 OPENAI_BASE_URL、OPENAI_API_KEY 和 MODEL_NAME。")
    logfire.configure(service_name="coder-cli", send_to_logfire="if-token-present", console=False)
    logfire.instrument_pydantic_ai()
    database = session_database()
    workspace = await session_workspace(database, session_id, path)
    database.parent.mkdir(parents=True, exist_ok=True)
    store = SqliteStepStore(database=str(database))
    history = await load_session_history(database, session_id) if session_id else []
    project = ProjectContext(workspace, database.parent / "project-context")
    await project.refresh()
    mcp = MCPRegistry()
    interaction = Interaction()
    model = OpenAIChatModel(
        model_name=os.environ['MODEL_NAME'],
        provider=OpenAIProvider(
            base_url=os.environ["OPENAI_BASE_URL"], api_key=os.environ["OPENAI_API_KEY"]
        ),
    )
    agent = Agent(
        model,
        capabilities=[
            AskUser(answerer=interaction.ask),
            LocalWorkspace(workspace), Coder(),
            Skills(str(Path(__file__).resolve().parents[1] / "skills")),
            Skills(
                Path.home() / ".agents" / "skills",
                missing_directories="skip", duplicate_names="keep_first",
            ),
            mcp,
            StepPersistence(store=store, metadata={"workspace": str(workspace)}, capture_frontier=True),
            ConversationSearch(SnapshotHistorySource(store), scope="conversation", max_matches=3),
            SummarizingCompaction(max_messages=60, keep_messages=20),
            Memory(
                FileStore(".agent-memory"), max_tokens=1000, max_search_results=3,
                injection_errors="raise",
            ),
        ],
        tools=[web_fetch],
        instructions=(Path(__file__).resolve().parents[1] / "prompts" / "system.md").read_text(encoding="utf-8"),
    )
    agent.instructions(name="project-context", on_change="rewrite")(project.instructions)
    if session_id is None:
        session_id = NativeConversation().conversation_id
    await save_session(database, session_id, workspace)
    return Conversation(
        agent, session_id, history=history, workspace=workspace, mcp=mcp, interaction=interaction,
        history_loader=partial(load_session_history, database),
    )
