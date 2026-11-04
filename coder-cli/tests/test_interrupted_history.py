import asyncio
from datetime import UTC, datetime, timedelta
from functools import partial
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest

from pydantic_ai import Agent
from pydantic_ai.exceptions import ModelRequestRejectedError
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness import StepPersistence
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore

from agent.conversation import Conversation
from storage.sessions import load_session_history
from tui.shell import ChatShell


def text_of(messages):
    return [part.content for message in messages for part in message.parts if isinstance(part, (TextPart, UserPromptPart))]


class InterruptedHistoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_interrupted_frontier_is_visible_and_never_replays_pending_tool(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'sessions.db'
            store = SqliteStepStore(database=str(database))
            await store.register_run(RunRecord(run_id='unfinished', conversation_id='session'))
            await store.save_snapshot(ContinuableSnapshot(
                run_id='unfinished', step_index=1, state='interrupted', messages=[
                    ModelRequest(parts=[UserPromptPart('配置 MCP')]),
                    ModelResponse(parts=[TextPart('已启动授权，等待用户反馈'), ToolCallPart('dangerous', {}, 'pending')]),
                ],
            ))
            # A newer failure before any history was captured must not hide existing progress.
            await store.register_run(RunRecord(
                run_id='empty-failure', conversation_id='session', started_at=datetime.now(UTC) + timedelta(seconds=1),
            ))
            history = await load_session_history(database, 'session')
            self.assertIn('已启动授权，等待用户反馈', text_of(history))
            returns = [p for m in history for p in m.parts if isinstance(p, ToolReturnPart)]
            self.assertEqual(returns[-1].outcome, 'interrupted')
            self.assertTrue(returns[-1].metadata['pydantic_ai_synthesized_tool_return'])
            shell = ChatShell(SimpleNamespace(workspace=Path(directory), session_id='session', history=history))
            async with shell.run_test(size=(100, 30)) as pilot:
                await pilot.pause()
                self.assertIn('已启动授权', shell.export_screenshot())
            def dangerous() -> str:
                self.fail('恢复历史不能自动重放未完成工具')
            def model(messages, info):
                self.assertIn('已启动授权，等待用户反馈', text_of(messages))
                return ModelResponse(parts=[TextPart('按用户反馈继续')])
            result = await Conversation(Agent(FunctionModel(model), tools=[dangerous]), 'session', history=history).send('已授权')
            self.assertEqual(result.output, '按用户反馈继续')

    async def test_failed_run_progress_survives_restart_and_next_same_process_send(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'sessions.db'
            store = SqliteStepStore(database=str(database))
            calls, effects = 0, 0
            def write_marker() -> str:
                nonlocal effects
                effects += 1
                return '配置文件已创建'
            def model(messages, info):
                nonlocal calls
                calls += 1
                if calls == 1:
                    return ModelResponse(parts=[TextPart('开始配置 MCP'), ToolCallPart('write_marker', {})])
                if calls == 2:
                    raise ModelRequestRejectedError('test', 'request failed')
                self.assertIn('开始配置 MCP', text_of(messages))
                self.assertTrue(any(isinstance(p, ToolReturnPart) and p.content == '配置文件已创建'
                                    for m in messages for p in m.parts))
                return ModelResponse(parts=[TextPart('继续配置')])
            conversation = Conversation(Agent(FunctionModel(model), tools=[write_marker], capabilities=[
                StepPersistence(store=store, capture_frontier=True),
            ]), 'session', history_loader=partial(load_session_history, database))
            with self.assertRaises(ModelRequestRejectedError):
                await conversation.send('配置 MCP')
            restored = await load_session_history(database, 'session')
            self.assertIn('开始配置 MCP', text_of(restored))
            result = await conversation.send('继续')
            self.assertEqual(result.output, '继续配置')
            self.assertEqual(effects, 1)

    async def test_prompt_is_saved_even_when_first_model_request_fails(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'sessions.db'
            def model(messages, info):
                raise ModelRequestRejectedError('test', 'first request failed')
            conversation = Conversation(Agent(FunctionModel(model), capabilities=[
                StepPersistence(store=SqliteStepStore(database=str(database)), capture_frontier=True),
            ]), 'session')
            with self.assertRaises(ModelRequestRejectedError):
                await conversation.send('尚未完成的用户请求')
            self.assertIn('尚未完成的用户请求', text_of(await load_session_history(database, 'session')))

    async def test_frontier_is_durable_while_tool_is_still_running(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'sessions.db'
            started = asyncio.Event()
            async def wait_tool() -> str:
                started.set()
                await asyncio.Event().wait()
                return 'unreachable'
            def model(messages, info):
                return ModelResponse(parts=[TextPart('正在等待授权'), ToolCallPart('wait_tool', {})])
            conversation = Conversation(Agent(FunctionModel(model), tools=[wait_tool], capabilities=[
                StepPersistence(store=SqliteStepStore(database=str(database)), capture_frontier=True),
            ]), 'session')
            task = asyncio.create_task(conversation.send('开始授权'))
            try:
                await asyncio.wait_for(started.wait(), 3)
                history = await load_session_history(database, 'session')
                self.assertIn('正在等待授权', text_of(history))
                self.assertTrue(any(isinstance(p, ToolReturnPart) and p.outcome == 'interrupted'
                                    for m in history for p in m.parts))
            finally:
                task.cancel()
                with self.assertRaises(asyncio.CancelledError):
                    await task
