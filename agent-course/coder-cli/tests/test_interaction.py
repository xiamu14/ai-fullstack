import asyncio
from copy import deepcopy
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from pydantic_ai import Agent
from pydantic_ai.messages import ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai_harness import AskUser, StepPersistence
from pydantic_ai_harness.step_persistence import SqliteStepStore

from agent.conversation import Conversation
from agent.interaction import Interaction
from storage.sessions import load_session_history
from tui.shell import ChatShell
from tui.prompt import PromptTextArea, StatusLine


QUESTION = {'questions': [{
    'header': '授权', 'question': '请完成浏览器授权，然后反馈结果。',
    'options': [{'label': '已完成授权'}, {'label': '取消'}],
}]}


class InteractionTests(unittest.IsolatedAsyncioTestCase):
    async def test_busy_feedback_reaches_same_run_and_persisted_history(self):
        started, release = asyncio.Event(), asyncio.Event()
        calls = 0
        async def wait_tool() -> str:
            started.set()
            await release.wait()
            return 'finished'
        async def model(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                yield {0: DeltaToolCall(name='wait_tool', json_args='{}')}
            else:
                self.assertTrue(any(isinstance(p, UserPromptPart) and p.content == '已授权'
                                    for m in messages for p in m.parts))
                yield '已收到反馈并继续'
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'sessions.db'
            conversation = Conversation(Agent(FunctionModel(stream_function=model), tools=[wait_tool], capabilities=[
                StepPersistence(store=SqliteStepStore(database=str(database))),
            ]))
            app = ChatShell(conversation)
            async with app.run_test() as pilot:
                prompt = app.query_one(PromptTextArea)
                prompt.insert('开始')
                await pilot.press('enter')
                await asyncio.wait_for(started.wait(), 3)
                prompt.insert('已授权')
                await pilot.press('enter')
                self.assertEqual(prompt.text, '')
                self.assertEqual(calls, 1)
                self.assertIn('已接收反馈', app.query_one(StatusLine).content)
                release.set()
                await app.turn_worker.wait()
                await pilot.pause()
                self.assertIn('已收到反馈并继续', app.export_screenshot())
            restored = await load_session_history(database, conversation.session_id)
            self.assertTrue(any(isinstance(p, UserPromptPart) and p.content == '已授权'
                                for m in restored for p in m.parts))

    async def test_authorization_question_waits_and_accepts_custom_text(self):
        await self.question_flow('已授权', '已授权')

    async def test_refusal_is_returned_without_becoming_approval(self):
        await self.question_flow('2', '取消')

    async def test_camel_case_multi_select_is_normalized_without_retry(self):
        question = deepcopy(QUESTION)
        question['questions'][0]['multiSelect'] = False
        await self.question_flow('已授权', '已授权', question)

    async def test_camel_case_multi_select_true_is_preserved(self):
        question = deepcopy(QUESTION)
        question['questions'][0]['multiSelect'] = True
        await self.question_flow('1', '已完成授权', question)

    async def question_flow(self, reply, expected, arguments=None):
        interaction = Interaction()
        arguments = QUESTION if arguments is None else arguments
        calls = 0
        async def model(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                yield {0: DeltaToolCall(name='ask_user_question', json_args=json.dumps(arguments))}
            else:
                answers = [p.content for m in messages for p in m.parts
                           if isinstance(p, ToolReturnPart) and p.tool_name == 'ask_user_question']
                self.assertEqual(answers[-1]['授权'], [expected])
                yield '完成反馈'
        agent = Agent(FunctionModel(stream_function=model), capabilities=[AskUser(answerer=interaction.ask)])
        conversation = Conversation(agent, interaction=interaction)
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            prompt = app.query_one(PromptTextArea)
            prompt.insert('需要授权')
            await pilot.press('enter')
            for _ in range(50):
                if '等待回答' in app.query_one(StatusLine).content:
                    break
                await pilot.pause(.02)
            self.assertTrue(app.busy)
            self.assertEqual(calls, 1)
            self.assertEqual(interaction.waiting[0].multi_select,
                             arguments['questions'][0].get('multiSelect', False))
            self.assertIn('请完成浏览器授权', app.export_screenshot())
            prompt.insert(reply)
            await pilot.press('enter')
            await app.turn_worker.wait()
            await pilot.pause()
            self.assertFalse(app.busy)
            self.assertIsNone(interaction.waiting)
            self.assertFalse(interaction.active)
            self.assertIn('完成反馈', app.export_screenshot())
            self.assertEqual(calls, 2)

    async def test_cancel_question_cleans_wait_and_next_turn_still_runs(self):
        interaction = Interaction()
        calls = 0
        async def model(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                yield {0: DeltaToolCall(name='ask_user_question', json_args=json.dumps(QUESTION))}
            else:
                yield '继续成功'
        conversation = Conversation(Agent(FunctionModel(stream_function=model), capabilities=[
            AskUser(answerer=interaction.ask),
        ]), interaction=interaction)
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            prompt = app.query_one(PromptTextArea)
            prompt.insert('授权')
            await pilot.press('enter')
            for _ in range(50):
                if '等待回答' in app.query_one(StatusLine).content:
                    break
                await pilot.pause(.02)
            self.assertIsNotNone(interaction.waiting)
            await pilot.press('ctrl+c')
            await pilot.pause()
            self.assertIsNone(interaction.waiting)
            self.assertFalse(interaction.active)
            self.assertEqual(conversation.history, [])
            prompt.insert('继续')
            await pilot.press('enter')
            await app.turn_worker.wait()
            self.assertFalse(app.busy)
            self.assertIn('继续成功', app.export_screenshot())

    async def test_message_during_teardown_is_sent_after_current_run(self):
        from contextlib import asynccontextmanager
        closing, release = asyncio.Event(), asyncio.Event()
        class Registry:
            @asynccontextmanager
            async def toolsets(self):
                try:
                    yield []
                finally:
                    closing.set()
                    await release.wait()
        calls = 0
        async def model(messages, info):
            nonlocal calls
            calls += 1
            yield f'回复{calls}'
        conversation = Conversation(Agent(FunctionModel(stream_function=model)), mcp=Registry())
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            prompt = app.query_one(PromptTextArea)
            prompt.insert('第一条')
            await pilot.press('enter')
            await asyncio.wait_for(closing.wait(), 3)
            prompt.insert('收尾时的反馈')
            await pilot.press('enter')
            self.assertEqual(app.pending, ['收尾时的反馈'])
            release.set()
            for _ in range(100):
                if not app.busy:
                    break
                await pilot.pause(.02)
            self.assertFalse(app.busy)
            self.assertEqual(calls, 2)
            self.assertTrue(any(isinstance(p, UserPromptPart) and p.content == '收尾时的反馈'
                                for m in conversation.history for p in m.parts))

    async def test_question_validation_still_rejects_unknown_or_conflicting_fields(self):
        from unittest.mock import AsyncMock
        from pydantic_ai.exceptions import UnexpectedModelBehavior
        for fields in ({'unsupported': False}, {'multiSelect': False, 'multi_select': True}):
            with self.subTest(fields=fields):
                interaction = Interaction()
                question = deepcopy(QUESTION)
                question['questions'][0].update(fields)
                async def model(messages, info):
                    yield {0: DeltaToolCall(name='ask_user_question', json_args=json.dumps(question))}
                agent = Agent(FunctionModel(stream_function=model), capabilities=[AskUser(answerer=interaction.ask)])
                callback = AsyncMock()
                conversation = Conversation(agent, interaction=interaction)
                with self.assertRaises(UnexpectedModelBehavior):
                    await conversation.send('提问', on_question=callback, on_text=AsyncMock())
                callback.assert_not_awaited()
                self.assertIsNone(interaction.waiting)
                self.assertFalse(interaction.active)
