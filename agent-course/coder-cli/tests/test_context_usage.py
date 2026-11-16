from pathlib import Path
from types import SimpleNamespace
import unittest

from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ModelResponse, TextPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.usage import RequestUsage, RunUsage

from agent.conversation import Conversation
from tui.prompt import ModeInfo
from tui.shell import ChatShell


def response(tokens, output=0):
    return ModelResponse(parts=[TextPart("reply")], usage=RequestUsage(input_tokens=tokens, output_tokens=output))


class ContextUsageTests(unittest.IsolatedAsyncioTestCase):
    def conversation(self, window=1000, history=None):
        model = FunctionModel(lambda messages, info: response(400, 100), profile={"context_window": window})
        return Conversation(Agent(model), history=history)

    async def test_latest_response_including_cache_not_cumulative_usage(self):
        latest = response(400, 100)
        latest.usage.cache_read_tokens = 300
        conversation = self.conversation(history=[response(900), latest])
        self.assertEqual(conversation.context_window_used, 0.5)
        conversation.history = [response(100)]
        self.assertEqual(conversation.context_window_used, 0.1)
        conversation.history = [response(1100)]
        self.assertEqual(conversation.context_window_used, 1.1)

    async def test_unknown_and_missing_usage_are_not_zero(self):
        for window, history in ((None, [response(200)]), (1000, []), (1000, [response(0)])):
            with self.subTest(window=window, history=history):
                self.assertIsNone(self.conversation(window, history).context_window_used)

    async def test_active_run_context_and_completed_run(self):
        conversation = self.conversation(history=[response(100)])
        conversation.interaction.context = RunContext(
            deps=None, model=conversation.agent.model, usage=RunUsage(), messages=[response(600)],
        )
        self.assertEqual(conversation.context_window_used, 0.6)
        conversation.interaction.close()
        await conversation.send("hello")
        self.assertEqual(conversation.context_window_used, 0.5)

    async def test_tui_restored_live_unknown_and_over_capacity(self):
        conversation = SimpleNamespace(
            workspace=Path.cwd(), session_id="demo", history=[], context_window_used=0.5,
        )
        app = ChatShell(conversation)
        async with app.run_test(size=(100, 28)) as pilot:
            label = app.query_one(ModeInfo)
            self.assertEqual(str(label.content), "Context ◑ 50%")
            self.assertIn("50%", app.export_screenshot())
            conversation.context_window_used = 0.75
            await pilot.pause(0.6)
            self.assertEqual(str(label.content), "Context ◕ 75%")
            conversation.context_window_used = 1.1
            app.update_context()
            self.assertEqual(str(label.content), "Context ● 110%")
            conversation.context_window_used = None
            app.update_context()
            self.assertEqual(str(label.content), "Context ○ --%")
            self.assertIn("未知", label.tooltip)
            await pilot.resize_terminal(65, 28)
            self.assertIn("--%", app.export_screenshot())
