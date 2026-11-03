import os
from pathlib import Path

import logfire
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.capabilities import MCP, LocalWorkspace
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai_harness import (
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

from conversation import Conversation
from sessions import load_session_history
from tools.web_tools import web_fetch


async def create_agent(session_id: str | None = None) -> Conversation:
    load_dotenv()
    if not all((os.getenv("MODEL_NAME"), os.getenv("OPENAI_BASE_URL"), os.getenv("OPENAI_API_KEY"))):
        raise ValueError("请在 .env 配置 OPENAI_BASE_URL、OPENAI_API_KEY 和 MODEL_NAME。")
    logfire.configure(service_name="coder-cli", send_to_logfire="if-token-present", console=False)
    logfire.instrument_pydantic_ai()
    workspace = Path("workspace").resolve()
    workspace.mkdir(exist_ok=True)
    store = SqliteStepStore(database=str(workspace / "sessions.db"))
    history = await load_session_history(workspace / "sessions.db", session_id) if session_id else []
    model = OpenAIChatModel(
        model_name=os.environ['MODEL_NAME'],
        provider=OpenAIProvider(
            base_url=os.environ["OPENAI_BASE_URL"], api_key=os.environ["OPENAI_API_KEY"]
        ),
    )
    weather = MCP("http://127.0.0.1:8000/mcp", id="weather", tool_prefix=True)
    agent = Agent(
        model,
        capabilities=[
            LocalWorkspace(workspace), Coder(),
            Skills(str(Path(__file__).resolve().parent / "skills")), weather,
            StepPersistence(store=store),
            ConversationSearch(SnapshotHistorySource(store), scope="conversation", max_matches=3),
            SummarizingCompaction(max_messages=60, keep_messages=20),
            Memory(
                FileStore(".agent-memory"), max_tokens=1000, max_search_results=3,
                injection_errors="raise",
            ),
        ],
        tools=[web_fetch],
        instructions=(
            "编码任务要实际创建并运行代码，验证输出后用中文说明结果；不要修改任务无关的文件。"
            "写文件前，先通过工具确认父目录存在；不存在时先用 shell 的 mkdir -p 创建。"
            "收到目录创建成功的结果后，才能调用 write_file；不能在同一批调用中创建目录并写入其中的文件。"
            "父目录就绪后，不同文件的独立写入可以并行。"
            "阶段结束时将用户明确偏好、已验证结论和未完成事项写入记忆，保留来源。"
            "写入前先搜索已有笔记，重复内容不追加，过时结论替换旧内容。"
            "需要旧细节时先搜索笔记，再搜索当前会话历史；代码事实以当前文件为准。"
        ),
    )
    return Conversation(agent, session_id, history=history)
