import asyncio
from contextlib import chdir, closing, contextmanager, redirect_stderr
from datetime import UTC, datetime, timedelta
from io import StringIO
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai import Agent
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness import StepPersistence
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore, StepEvent

from agent.runtime import create_agent
from integrations.mcp import Config
from main import main
from storage.sessions import load_session_history, list_sessions
from tui.shell import ChatShell
from tui.prompt import PromptTextArea, StatusLine
from tui.tools import ToolCall


def prompts(messages):
    return [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart) and isinstance(p.content, str)]


@contextmanager
def runtime_model(model):
    env = {"MODEL_NAME": "test", "OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test-key"}
    with patch.dict(os.environ, env), patch("agent.runtime.load_dotenv"), \
         patch("agent.runtime.OpenAIChatModel", return_value=model), \
         patch("integrations.mcp.MCPRegistry.read", return_value=Config()), \
         patch("agent.runtime.logfire.configure"), patch("agent.runtime.logfire.instrument_pydantic_ai"), \
         patch("storage.sessions.SESSION_DATABASE", Path("workspace/sessions.db").resolve()):
        yield


async def save_first_turn(database):
    calls = 0

    def evidence(value: str) -> str:
        return value

    def model(messages, info):
        nonlocal calls
        calls += 1
        part = ToolCallPart("evidence", {"value": "EVIDENCE_7319"}) if calls == 1 else TextPart("已记录证据")
        return ModelResponse(parts=[part])

    agent = Agent(FunctionModel(model), tools=[evidence], capabilities=[
        StepPersistence(store=SqliteStepStore(database=str(database))),
    ])
    return await agent.run("记住证据", conversation_id="saved-session")


class ResumeEntryTests(unittest.TestCase):
    def test_cli_passes_session_id_to_factory_and_starts_shell(self):
        with patch("sys.argv", ["main.py", "--sessionId", "saved-session"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.create_agent") as create, patch("main.ChatShell") as shell:
            shell.return_value.return_code = 0
            self.assertEqual(main(), 0)
        create.assert_awaited_once_with("saved-session", None)
        shell.assert_called_once_with(create.return_value)
        shell.return_value.run.assert_called_once_with()

    def test_factory_error_stops_before_shell_and_redacts_secret(self):
        with patch("sys.argv", ["main.py", "--sessionId", "saved-session"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.create_agent", side_effect=ValueError("损坏的快照 test-secret")), \
             patch.dict(os.environ, {"OPENAI_API_KEY": "test-secret"}), \
             patch("main.ChatShell") as shell, redirect_stderr(StringIO()) as output, \
             self.assertRaises(SystemExit) as stopped:
            main()
        self.assertEqual(stopped.exception.code, 1)
        shell.assert_not_called()
        self.assertIn("损坏的快照", output.getvalue())
        self.assertNotIn("test-secret", output.getvalue())

    def test_new_process_creates_restored_runtime_and_persists_next_turn(self):
        root = Path(__file__).resolve().parents[1]
        with TemporaryDirectory() as directory:
            database = Path(directory) / "workspace" / "sessions.db"
            asyncio.run(save_first_turn(database))
            probe = """
import asyncio
from unittest.mock import patch
from pydantic_ai.messages import TextPart, ToolReturnPart, UserPromptPart, ModelResponse
from pydantic_ai.models.function import FunctionModel
from pathlib import Path
from integrations.mcp import Config
from storage import sessions
from agent.runtime import create_agent
from tui.shell import ChatShell
from tui.prompt import PromptTextArea, StatusLine

def model(messages, info):
    prompts = [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart) and isinstance(p.content, str)]
    assert prompts == ["记住证据", "继续验证"], prompts
    assert any(isinstance(p, ToolReturnPart) and p.content == "EVIDENCE_7319" for m in messages for p in m.parts)
    return ModelResponse(parts=[TextPart("已使用旧上下文")])

async def stream_model(messages, info):
    yield model(messages, info).parts[0].content

async def run():
    sessions.SESSION_DATABASE = Path("workspace/sessions.db").resolve()
    with patch("agent.runtime.load_dotenv"), patch("integrations.mcp.MCPRegistry.read", return_value=Config()), \\
         patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(model, stream_function=stream_model)), \\
         patch("agent.runtime.logfire.configure"), patch("agent.runtime.logfire.instrument_pydantic_ai"):
        conversation = await create_agent("saved-session")
    assert conversation.history
    app = ChatShell(conversation)
    async with app.run_test() as pilot:
        app.query_one(PromptTextArea).insert("继续验证")
        await pilot.press("enter")
        await app.turn_worker.wait()
        assert conversation.history[-1].parts[0].content == "已使用旧上下文"
    print("HISTORY_RESUMED")
asyncio.run(run())
"""
            process = subprocess.run(
                [sys.executable, "-c", probe],
                env={**os.environ, "PYTHONPATH": str(root), "MODEL_NAME": "test",
                     "OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test-key"},
                cwd=directory, capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertIn("HISTORY_RESUMED", process.stdout)
            restored = asyncio.run(load_session_history(database, "saved-session"))
            self.assertEqual(prompts(restored), ["记住证据", "继续验证"])


class ResumeFactoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_empty_session_is_listed_in_another_process_and_resumes_without_a_model_call(self):
        root = Path(__file__).resolve().parents[1]
        with TemporaryDirectory() as directory, chdir(directory):
            project = Path.cwd() / "example"
            project.mkdir()
            with runtime_model(FunctionModel(lambda m, i: self.fail("空会话不能调用模型"))):
                conversation = await create_agent(path="./example")
                shell = ChatShell(conversation)
                async with shell.run_test():
                    self.assertEqual(shell.query_one(StatusLine).content, conversation.session_id)
            database = Path("workspace/sessions.db").resolve()
            probe = """
from pathlib import Path
import sys
from storage import sessions
sessions.SESSION_DATABASE = Path(sys.argv[1])
from main import main
sys.argv = ["main.py", "--sessions"]
main()
"""
            process = subprocess.run(
                [sys.executable, "-c", probe, str(database)],
                env={**os.environ, "PYTHONPATH": str(root)},
                cwd=project, capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertIn(conversation.session_id, process.stdout)
            self.assertIn(str(project), process.stdout)
            self.assertIn("Untitled session", process.stdout)
            with runtime_model(FunctionModel(lambda m, i: self.fail("恢复空会话不能调用模型"))):
                resumed = await create_agent(conversation.session_id)
            self.assertEqual(resumed.workspace, project)
            self.assertEqual(resumed.history, [])
            self.assertEqual(resumed.session_id, conversation.session_id)

    async def test_factory_restores_context_before_shell_and_shell_only_renders(self):
        with TemporaryDirectory() as directory, chdir(directory):
            await save_first_turn(Path("workspace/sessions.db"))
            observed = []

            async def model(messages, info):
                observed.append(prompts(messages))
                yield "继续完成"

            with runtime_model(FunctionModel(stream_function=model)):
                conversation = await create_agent("saved-session")
            self.assertEqual(prompts(conversation.history), ["记住证据"])
            self.assertTrue(any(isinstance(p, ToolReturnPart) for m in conversation.history for p in m.parts))
            app = ChatShell(conversation)
            async with app.run_test(size=(100, 36)) as pilot:
                self.assertEqual(observed, [])
                self.assertEqual([m.content for m in app.query(".message")], ["记住证据", "已记录证据"])
                self.assertEqual(app.query_one(ToolCall).status, "completed")
                app.query_one(PromptTextArea).insert("继续")
                await pilot.press("enter")
                await app.turn_worker.wait()
                self.assertEqual(observed, [["记住证据", "继续"]])

    async def test_factory_propagates_load_error_without_using_empty_history(self):
        with TemporaryDirectory() as directory, chdir(directory), \
             runtime_model(FunctionModel(lambda m, i: ModelResponse(parts=[TextPart("不应调用")]))), \
             patch("agent.runtime.load_session_history", side_effect=ValueError("损坏的快照")):
            with self.assertRaisesRegex(ValueError, "损坏的快照"):
                await create_agent("saved-session")

    async def test_new_session_is_created_by_framework_and_saved_before_first_message(self):
        with TemporaryDirectory() as directory, chdir(directory), \
             runtime_model(FunctionModel(lambda m, i: ModelResponse(parts=[TextPart("回复")]))), \
             patch("agent.runtime.load_session_history") as load:
            conversation = await create_agent()
            self.assertIsNotNone(conversation.session_id)
            self.assertEqual(conversation.history, [])
            rows = await list_sessions(Path("workspace/sessions.db"))
            self.assertEqual([row.session_id for row in rows], [conversation.session_id])
            self.assertEqual(rows[0].workspace, str(Path.cwd()))
            load.assert_not_awaited()

    async def test_factory_waits_for_history_before_returning_runtime(self):
        started, release = asyncio.Event(), asyncio.Event()
        history = [ModelRequest(parts=[UserPromptPart("已有消息")])]

        async def load(database, session_id):
            started.set()
            await release.wait()
            return history

        with TemporaryDirectory() as directory, chdir(directory), \
             runtime_model(FunctionModel(lambda m, i: ModelResponse(parts=[TextPart("回复")]))), \
             patch("agent.runtime.load_session_history", side_effect=load):
            pending = asyncio.create_task(create_agent("demo"))
            await started.wait()
            self.assertFalse(pending.done())
            release.set()
            conversation = await pending
            self.assertIs(conversation.history, history)


class ResumeHistoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_existing_database_gets_ordered_index_without_temporary_sort(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(database))
            now = datetime.now(UTC)
            for run_id in ("z-first", "a-second"):
                await store.register_run(RunRecord(
                    run_id=run_id, conversation_id="saved", started_at=now,
                ))
                await store.append_event(StepEvent(run_id=run_id, kind="run_completed", step_index=1))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=run_id, step_index=1,
                    messages=[ModelRequest(parts=[UserPromptPart(run_id)])],
                ))
            statements = []
            connect = sqlite3.connect

            def traced_connect(*args, **kwargs):
                connection = connect(*args, **kwargs)
                connection.set_trace_callback(statements.append)
                return connection

            with patch("storage.sessions.sqlite3.connect", side_effect=traced_connect):
                for _ in range(2):
                    self.assertEqual(prompts(await load_session_history(database, "saved")), ["a-second"])
            query = next(sql for sql in statements if "SELECT r.run_id FROM runs AS r" in sql)
            with closing(connect(database)) as connection:
                plan = [row[3] for row in connection.execute("EXPLAIN QUERY PLAN " + query)]
                self.assertTrue(any("idx_runs_top_conversation_started" in detail for detail in plan), plan)
                self.assertFalse(any("TEMP B-TREE" in detail for detail in plan), plan)
                self.assertEqual(connection.execute("SELECT count(*) FROM runs").fetchone()[0], 2)

    async def test_database_selects_latest_frontier_and_loads_only_one_snapshot(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(database))
            now = datetime.now(UTC)
            for index, (run_id, session_id, parent, kind) in enumerate((
                ("old", "saved", None, "run_completed"),
                ("latest", "saved", None, "run_completed"),
                ("failed", "saved", None, "run_failed"),
                ("unfinished", "saved", None, "run_started"),
                ("child", "saved", "latest", "run_completed"),
                ("other", "other-session", None, "run_completed"),
            )):
                await store.register_run(RunRecord(
                    run_id=run_id, conversation_id=session_id, parent_run_id=parent,
                    started_at=now + timedelta(seconds=index),
                ))
                await store.append_event(StepEvent(run_id=run_id, kind=kind, step_index=1))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=run_id, step_index=1,
                    messages=[ModelRequest(parts=[UserPromptPart(run_id)])],
                ))
            with patch("storage.sessions.SqliteStepStore", return_value=store), \
                 patch.object(store, "list_runs", side_effect=AssertionError("不能遍历 runs")), \
                 patch.object(store, "list_events", side_effect=AssertionError("不能加载全部 events")), \
                 patch.object(store, "latest_snapshot", wraps=store.latest_snapshot) as snapshot:
                self.assertEqual(prompts(await load_session_history(database, "saved")), ["unfinished"])
                snapshot.assert_awaited_once_with(run_id="unfinished", include_interrupted=True)
                self.assertEqual(await load_session_history(database, "saved' OR 1=1 --"), [])

    async def test_latest_failed_run_is_restored_but_child_and_other_sessions_are_excluded(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            first = await save_first_turn(database)
            store = SqliteStepStore(database=str(database))
            for run_id, session_id, parent, kind in (
                ("failed", "saved-session", None, "run_failed"),
                ("child", "saved-session", first.run_id, "run_completed"),
                ("other", "other-session", None, "run_completed"),
            ):
                await store.register_run(RunRecord(run_id=run_id, conversation_id=session_id, parent_run_id=parent))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=run_id, step_index=1,
                    messages=[ModelRequest(parts=[UserPromptPart(f"{run_id}进度")])],
                ))
                await store.append_event(StepEvent(run_id=run_id, kind=kind, step_index=1))
            self.assertEqual(prompts(await load_session_history(database, "saved-session")), ["failed进度"])
            self.assertEqual(await load_session_history(database, "missing-session"), [])

    async def test_missing_database_is_empty_but_missing_successful_snapshot_is_an_error(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            self.assertEqual(await load_session_history(database, "new-session"), [])
            self.assertFalse(database.exists())
            store = SqliteStepStore(database=str(database))
            await store.register_run(RunRecord(run_id="broken", conversation_id="broken-session"))
            await store.append_event(StepEvent(run_id="broken", kind="run_completed", step_index=1))
            with self.assertRaisesRegex(ValueError, "缺少消息快照"):
                await load_session_history(database, "broken-session")
