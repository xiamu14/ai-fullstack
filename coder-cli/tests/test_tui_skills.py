import asyncio
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, Mock

from pydantic_ai.usage import RunUsage
from textual.widgets import Input, OptionList

from agent.conversation import SkillInvocationError
from tui.messages import MessageHistory
from tui.prompt import Prompt, PromptTextArea
from tui.shell import ChatShell
from tui.skills import SlashComplete, SlashCompleteInput


class TuiSkillsTests(unittest.IsolatedAsyncioTestCase):
    def conversation(self):
        return SimpleNamespace(
            workspace=Path.cwd(), session_id="demo", history=[],
            skill_catalog=AsyncMock(return_value=SimpleNamespace(skipped=[], skills=[
                SimpleNamespace(name="download", description="下载图片", user_invocable=True),
                SimpleNamespace(name="hidden", description="隐藏", user_invocable=False),
                SimpleNamespace(name="review", description="审查代码", user_invocable=True),
            ])),
            send=AsyncMock(return_value=SimpleNamespace(output="done", new_messages=lambda: [], usage=RunUsage())),
            feedback=Mock(return_value=True),
        )

    async def test_search_choose_submit_and_recall_explicit_skill(self):
        conversation = self.conversation()
        app = ChatShell(conversation)
        async with app.run_test(size=(100, 34)) as pilot:
            prompt = app.query_one(PromptTextArea)
            await pilot.press("/")
            await pilot.pause()
            picker = app.query_one(SlashComplete)
            self.assertTrue(picker.display)
            self.assertIsInstance(app.focused, SlashCompleteInput)
            options = picker.query_one(OptionList)
            self.assertEqual(options.option_count, 2)
            picker.query_one(Input).value = "审查"
            await pilot.pause()
            self.assertEqual(options.option_count, 1)
            self.assertIn("/review", app.export_screenshot())
            await pilot.press("enter")
            self.assertIs(app.focused, prompt)
            self.assertEqual(prompt.text, "/review ")
            self.assertEqual(prompt.skill_name, "review")
            self.assertFalse(app.query_one(Prompt).has_class("-show-slash-complete"))
            prompt.insert("src/main.py")
            await pilot.press("enter")
            await app.turn_worker.wait()
            conversation.send.assert_awaited_once()
            self.assertEqual(conversation.send.call_args.args[0], "src/main.py")
            self.assertEqual(conversation.send.call_args.kwargs["skill_name"], "review")
            self.assertEqual(list(app.query(".message"))[0].content, "/review src/main.py")
            await pilot.press("alt+up")
            self.assertEqual(prompt.skill_name, "review")
            self.assertEqual(prompt.text, "/review src/main.py")
            await pilot.press("alt+down")
            await pilot.press("/")
            await pilot.pause()
            await pilot.press("enter")
            prompt.insert("draft")
            await pilot.press("alt+up", "alt+down")
            self.assertEqual(prompt.text, "/download draft")
            self.assertEqual(prompt.skill_name, "download")

    async def test_dismiss_paths_and_editing_prefix_leave_plain_text(self):
        conversation = self.conversation()
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            prompt = app.query_one(PromptTextArea)
            await pilot.press("/")
            await pilot.pause()
            await pilot.press("escape")
            self.assertIs(app.focused, prompt)
            prompt.load_text("/tmp/example.txt")
            await pilot.press("enter")
            await app.turn_worker.wait()
            self.assertNotIn("skill_name", conversation.send.call_args.kwargs)
            self.assertEqual(conversation.send.call_args.args[0], "/tmp/example.txt")
            await pilot.press("/")
            await pilot.pause()
            await pilot.press("down", "up", "enter")
            self.assertEqual(prompt.skill_name, "download")
            prompt.load_text("ordinary text")
            await pilot.pause()
            self.assertIsNone(prompt.skill_name)

    async def test_unavailable_skill_reports_error_and_shell_recovers(self):
        conversation = self.conversation()
        conversation.send.side_effect = SkillInvocationError("技能不可用：download")
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            await pilot.press("/")
            await pilot.pause()
            await pilot.press("enter", "enter")
            await app.turn_worker.wait()
            self.assertFalse(app.busy)
            self.assertIn("技能不可用", list(app.query(".error"))[0].content)

    async def test_busy_input_remains_feedback_without_skill_expansion(self):
        conversation = self.conversation()
        started, release = asyncio.Event(), asyncio.Event()

        async def send(*args, **kwargs):
            started.set()
            await release.wait()
            return SimpleNamespace(output="done", new_messages=lambda: [], usage=RunUsage())

        conversation.send.side_effect = send
        app = ChatShell(conversation)
        async with app.run_test() as pilot:
            prompt = app.query_one(PromptTextArea)
            prompt.insert("task")
            await pilot.press("enter")
            await started.wait()
            prompt.insert("/")
            await pilot.press("enter")
            conversation.skill_catalog.assert_not_awaited()
            conversation.feedback.assert_called_once_with("/")
            release.set()
            await app.turn_worker.wait()
