"""The user stays in Super while independent role reports appear inline."""
import asyncio
import unittest

from pydantic_ai.messages import ModelResponse, TextPart

from tests import test_multi_agent as fixtures
from tui.messages import MessageHistory
from tui.prompt import PromptTextArea
from tui.shell import ChatShell


class TuiMultiAgentTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = fixtures.MultiAgentTests.asyncSetUp
    build = fixtures.MultiAgentTests.build
    settle = fixtures.MultiAgentTests.settle

    async def test_explicit_reviewer_runs_while_super_is_busy(self):
        started, release = asyncio.Event(), asyncio.Event()
        requests = []

        async def super_stream(messages, info):
            requests.append(str(messages))
            if len(requests) == 2:
                self.assertIn("Reviewer 交付 B", requests[-1])
                yield "Super 单独回应 B"
                return
            started.set()
            await release.wait()
            yield "Super 完成 A"
        model = fixtures.FunctionModel(stream_function=super_stream)
        reviewer = fixtures.simulated(lambda messages, info: ModelResponse(parts=[TextPart("Reviewer 交付 B")]))
        conversation = await self.build([model, reviewer])
        app = ChatShell(conversation)
        async with app.run_test(size=(100, 34)) as pilot:
            prompt = app.query_one(PromptTextArea)
            prompt.insert("执行 A")
            await pilot.press("enter")
            await asyncio.wait_for(started.wait(), 5)
            self.assertTrue(app.busy)
            prompt.insert("/reviewer 审核 B")
            await pilot.press("enter")
            async with asyncio.timeout(10):
                while not conversation.delegations.owner.records:
                    await pilot.pause(.05)
                await self.settle(conversation)
            await pilot.pause()
            self.assertTrue(app.busy, "Super 仍在执行 A")
            self.assertEqual(len(requests), 1)
            self.assertNotIn("Reviewer 交付 B", requests[0])
            messages = [message.content for message in app.query_one(MessageHistory).query(".message")]
            self.assertTrue(any("Reviewer 交付 B" in message for message in messages))
            self.assertIs(app.conversation, conversation)
            release.set()
            record = next(iter(conversation.delegations.owner.records.values()))
            async with asyncio.timeout(10):
                while not record.delivered:
                    await pilot.pause(.05)
            await app.turn_worker.wait()
            self.assertEqual(len(requests), 2)
            request_ids = {message.run_id for message in conversation.history if message.run_id}
            self.assertEqual(len(request_ids), 2)

    async def test_role_request_is_in_slash_picker(self):
        model = fixtures.simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([model])
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            await pilot.press("/")
            await pilot.pause()
            from tui.skills import SlashComplete
            picker = app.query_one(SlashComplete)
            names = [name for name, _ in picker.skills]
            self.assertEqual(names[:3], ["architect", "executor", "reviewer"])
            self.assertEqual(names[3:], sorted(names[3:]))
