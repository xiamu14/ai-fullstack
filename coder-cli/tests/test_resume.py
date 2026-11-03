import asyncio
from contextlib import chdir, contextmanager, redirect_stderr
from io import StringIO
import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai import Agent
from pydantic_ai.capabilities import Capability
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness import StepPersistence
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore, StepEvent

from agent_runtime import create_agent
from main import main
from sessions import load_session_history
from tui.shell import ChatShell
from tui.prompt import PromptTextArea
from tui.tools import ToolCall


def prompts(messages):
    return [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart) and isinstance(p.content, str)]


@contextmanager
def runtime_model(model):
    env = {"MODEL_NAME": "test", "OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test-key"}
    with patch.dict(os.environ, env), patch("agent_runtime.load_dotenv"), \
         patch("agent_runtime.OpenAIChatModel", return_value=model), \
         patch("agent_runtime.MCP", return_value=Capability()), \
         patch("agent_runtime.logfire.configure"), patch("agent_runtime.logfire.instrument_pydantic_ai"):
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
        create.assert_awaited_once_with("saved-session")
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
from pydantic_ai.capabilities import Capability
from pydantic_ai.messages import TextPart, ToolReturnPart, UserPromptPart, ModelResponse
from pydantic_ai.models.function import FunctionModel
from agent_runtime import create_agent
from tui.shell import ChatShell
from tui.prompt import PromptTextArea

def model(messages, info):
    prompts = [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart) and isinstance(p.content, str)]
    assert prompts == ["记住证据", "继续验证"], prompts
    assert any(isinstance(p, ToolReturnPart) and p.content == "EVIDENCE_7319" for m in messages for p in m.parts)
    return ModelResponse(parts=[TextPart("已使用旧上下文")])

async def stream_model(messages, info):
    yield model(messages, info).parts[0].content

async def run():
    with patch("agent_runtime.load_dotenv"), patch("agent_runtime.MCP", return_value=Capability()), \\
         patch("agent_runtime.OpenAIChatModel", return_value=FunctionModel(model, stream_function=stream_model)), \\
         patch("agent_runtime.logfire.configure"), patch("agent_runtime.logfire.instrument_pydantic_ai"):
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
             patch("agent_runtime.load_session_history", side_effect=ValueError("损坏的快照")):
            with self.assertRaisesRegex(ValueError, "损坏的快照"):
                await create_agent("saved-session")

    async def test_new_session_is_left_to_agent_and_does_not_read_history(self):
        with TemporaryDirectory() as directory, chdir(directory), \
             runtime_model(FunctionModel(lambda m, i: ModelResponse(parts=[TextPart("回复")]))), \
             patch("agent_runtime.load_session_history") as load:
            conversation = await create_agent()
            self.assertIsNone(conversation.session_id)
            self.assertEqual(conversation.history, [])
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
             patch("agent_runtime.load_session_history", side_effect=load):
            pending = asyncio.create_task(create_agent("demo"))
            await started.wait()
            self.assertFalse(pending.done())
            release.set()
            conversation = await pending
            self.assertIs(conversation.history, history)


class ResumeHistoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_failed_child_and_other_sessions_do_not_replace_successful_context(self):
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
                    messages=[ModelRequest(parts=[UserPromptPart("不应恢复")])],
                ))
                await store.append_event(StepEvent(run_id=run_id, kind=kind, step_index=1))
            self.assertEqual(prompts(await load_session_history(database, "saved-session")), ["记住证据"])
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
