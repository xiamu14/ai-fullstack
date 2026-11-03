import asyncio
from contextlib import chdir, redirect_stderr
from io import StringIO
import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai import Agent
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness import StepPersistence
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore, StepEvent

from main import main
from conversation import Conversation
from sessions import load_session_history
from tui.app import ChatApp
from tui.prompt import PromptTextArea
from tui.tools import ToolCall


def prompts(messages):
    return [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart)]


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
    def test_cli_restores_saved_native_messages_before_starting_tui(self):
        with TemporaryDirectory() as directory, chdir(directory):
            database = Path("workspace/sessions.db")
            asyncio.run(save_first_turn(database))
            with patch("sys.argv", ["main.py", "--sessionId", "saved-session"]), \
                 patch("main.sys.stdin.isatty", return_value=True), \
                 patch("main.sys.stdout.isatty", return_value=True), \
                 patch("main.create_agent"), patch("main.ChatApp") as app:
                main()
            history = app.call_args.args[0].history
            self.assertEqual(prompts(history), ["记住证据"])
            returns = [p.content for m in history for p in m.parts if isinstance(p, ToolReturnPart)]
            self.assertIn("EVIDENCE_7319", returns)

    def test_new_process_continues_saved_context_and_persists_next_turn(self):
        root = Path(__file__).resolve().parents[1]
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            asyncio.run(save_first_turn(database))
            probe = """
import asyncio
from pathlib import Path
import sys
from pydantic_ai import Agent
from pydantic_ai.messages import ModelResponse, TextPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness import StepPersistence
from pydantic_ai_harness.step_persistence import SqliteStepStore
from conversation import Conversation
from sessions import load_session_history

def model(messages, info):
    prompts = [p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart)]
    assert prompts == ["记住证据", "继续验证"], prompts
    assert any(isinstance(p, ToolReturnPart) and p.content == "EVIDENCE_7319" for m in messages for p in m.parts)
    return ModelResponse(parts=[TextPart("已使用旧上下文")])

async def run():
    database = Path(sys.argv[1])
    history = await load_session_history(database, "saved-session")
    agent = Agent(FunctionModel(model), capabilities=[StepPersistence(store=SqliteStepStore(database=str(database)))])
    await Conversation(agent, "saved-session", history=history).send("继续验证")
    print("HISTORY_RESUMED")
asyncio.run(run())
"""
            process = subprocess.run(
                [sys.executable, "-c", probe, str(database)],
                env={**os.environ, "PYTHONPATH": str(root)},
                capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertIn("HISTORY_RESUMED", process.stdout)
            restored = asyncio.run(load_session_history(database, "saved-session"))
            self.assertEqual(prompts(restored), ["记住证据", "继续验证"])

    def test_cli_stops_if_history_cannot_be_loaded(self):
        with patch("sys.argv", ["main.py", "--sessionId", "saved-session"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.load_session_history", side_effect=ValueError("损坏的快照")), \
             patch("main.create_agent") as create, patch("main.ChatApp") as app, \
             redirect_stderr(StringIO()), self.assertRaises(SystemExit) as stopped:
            main()
        self.assertEqual(stopped.exception.code, 1)
        create.assert_not_called()
        app.assert_not_called()


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
            restored = await load_session_history(database, "saved-session")
            self.assertEqual(prompts(restored), ["记住证据"])
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

    async def test_tui_restores_messages_and_tools_without_calling_model_on_startup(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            await save_first_turn(database)
            history = await load_session_history(database, "saved-session")
            observed = []

            async def model(messages, info):
                observed.append(prompts(messages))
                yield "继续完成"

            conversation = Conversation(Agent(FunctionModel(stream_function=model)), "saved-session", history=history)
            app = ChatApp(conversation)
            async with app.run_test(size=(100, 36)) as pilot:
                self.assertEqual(observed, [])
                self.assertEqual([m.content for m in app.query(".message")], ["记住证据", "已记录证据"])
                self.assertEqual(app.query_one(ToolCall).status, "completed")
                app.query_one(PromptTextArea).insert("继续")
                await pilot.press("enter")
                await app.turn_worker.wait()
                self.assertEqual(observed, [["记住证据", "继续"]])
                self.assertEqual([m.content for m in app.query(".message")],
                                 ["记住证据", "已记录证据", "继续", "继续完成"])
