import asyncio
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

from pydantic_ai import Agent
from pydantic_ai.exceptions import ModelRequestRejectedError
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai.usage import RunUsage

from agent.conversation import Conversation

from tui.shell import ChatShell
from tui.messages import MessageHistory
from tui.prompt import PromptTextArea as Prompt, PromptContainer
from tui.tools import ToolCall, ToolCallHeader
from tui.turn import TurnView


def result(text):
    return SimpleNamespace(output=text, new_messages=lambda: [], usage=RunUsage())


class TuiTests(unittest.IsolatedAsyncioTestCase):
    async def test_restored_reply_wraps_at_margin_boundary_without_clipping(self):
        text = "中" * 57 + " END"
        messages = [ModelResponse(parts=[TextPart(text)]), ModelRequest(parts=[UserPromptPart("下一轮")])]
        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=messages))
        async with app.run_test(size=(122, 34)) as pilot:
            await pilot.pause()
            self.assertIn("END", app.export_screenshot())
            for width in (80, 122):
                await pilot.resize_terminal(width, 34)
                await pilot.pause()
                self.assertIn("END", app.export_screenshot())

    async def test_streamed_reply_wraps_at_margin_boundary_without_clipping(self):
        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[]))
        async with app.run_test(size=(122, 34)) as pilot:
            history = app.query_one(MessageHistory)
            view = TurnView(history)
            text = "中" * 57 + " END"
            await view.write(text[:-3])
            await pilot.pause()
            await view.write("END")
            await view.finish(text)
            await history.add("user", "下一轮")
            await pilot.pause()
            self.assertIn("END", app.export_screenshot())

    async def test_multiline_paste_streaming_and_input_history(self):
        started, release = asyncio.Event(), asyncio.Event()

        async def send(text, on_text, *, on_tool=None):
            await on_text("**流式")
            await on_text("回复**")
            started.set()
            await release.wait()
            return result("**完整回复**")

        conversation = SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[], send=AsyncMock(side_effect=send))
        app = ChatShell(conversation)
        async with app.run_test(size=(90, 28)) as pilot:
            prompt = app.query_one(Prompt)
            self.assertIs(app.focused, prompt)
            await pilot.press("enter")
            self.assertFalse(app.busy)
            prompt.insert("第一行\n第二行")
            await pilot.press("ctrl+j")
            prompt.insert("第三行")
            await pilot.press("enter")
            await started.wait()
            await pilot.pause()
            self.assertTrue(app.busy)
            self.assertIn("流式回复", app.export_screenshot())
            release.set()
            await app.turn_worker.wait()
            await pilot.pause()
            conversation.send.assert_awaited_once()
            self.assertEqual(conversation.send.call_args.args[0], "第一行\n第二行\n第三行")
            self.assertEqual([m.content for m in app.query(".message")],
                             ["第一行\n第二行\n第三行", "**完整回复**"])
            self.assertFalse(app.busy)
            self.assertEqual(prompt.text, "")
            prompt.insert("尚未提交的草稿")
            await pilot.press("alt+up")
            self.assertEqual(prompt.text, "第一行\n第二行\n第三行")
            await pilot.press("alt+down")
            self.assertEqual(prompt.text, "尚未提交的草稿")
            self.assertLess(app.query_one(MessageHistory).region.bottom, prompt.region.bottom)
            self.assertLessEqual(prompt.region.bottom, 28)
            self.assertIn("demo", app.export_screenshot())

    async def test_busy_rejects_second_submit_and_error_allows_next_turn(self):
        started, release = asyncio.Event(), asyncio.Event()

        async def send(text, on_text, *, on_tool=None):
            if text == "失败请求":
                started.set()
                await release.wait()
                raise ModelRequestRejectedError("test", "HTTP 400 secret-key")
            return result("恢复成功")

        conversation = SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[], send=AsyncMock(side_effect=send))
        app = ChatShell(conversation)
        with patch.dict("os.environ", {"OPENAI_API_KEY": "secret-key"}):
            async with app.run_test() as pilot:
                prompt = app.query_one(Prompt)
                prompt.insert("失败请求")
                await pilot.press("enter")
                await started.wait()
                prompt.insert("恢复请求")
                await pilot.press("enter")
                self.assertEqual(conversation.send.await_count, 1)
                self.assertEqual(prompt.text, "恢复请求")
                release.set()
                await app.turn_worker.wait()
                await pilot.pause()
                errors = list(app.query(".error"))
                self.assertIn("HTTP 400", errors[0].content)
                self.assertNotIn("secret-key", errors[0].content)
                self.assertFalse(app.busy)
                await pilot.press("enter")
                await app.turn_worker.wait()
                self.assertEqual(list(app.query(".message"))[-1].content, "恢复成功")

    async def test_cancel_does_not_exit_and_next_turn_can_run(self):
        started = asyncio.Event()

        async def send(text, on_text, *, on_tool=None):
            if text == "耗时请求":
                started.set()
                await asyncio.Event().wait()
            return result("继续成功")

        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[], send=AsyncMock(side_effect=send)))
        async with app.run_test() as pilot:
            prompt = app.query_one(Prompt)
            prompt.insert("耗时请求")
            await pilot.press("enter")
            await started.wait()
            await pilot.press("ctrl+c")
            await pilot.pause()
            self.assertFalse(app.busy)
            self.assertIn("不会回滚", list(app.query(".error"))[0].content)
            prompt.insert("继续")
            await pilot.press("enter")
            await app.turn_worker.wait()
            self.assertEqual(list(app.query(".message"))[-1].content, "继续成功")

    async def test_scroll_back_is_preserved_and_small_terminal_keeps_input_visible(self):
        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[]))
        async with app.run_test(size=(48, 16)) as pilot:
            history = app.query_one(MessageHistory)
            for i in range(12):
                await history.add("assistant", f"第 {i} 轮\n\n" + "回复内容\n\n" * 5)
            await pilot.pause()
            self.assertAlmostEqual(history.scroll_y, history.max_scroll_y, delta=1)
            await pilot.press("pageup")
            await pilot.pause()
            previous = history.scroll_y
            self.assertLess(previous, history.max_scroll_y)
            await history.add("assistant", "新增回复")
            await pilot.pause()
            self.assertAlmostEqual(history.scroll_y, previous, delta=1)
            self.assertLessEqual(app.query_one(Prompt).region.bottom, 16)

    async def test_real_conversation_runs_two_streamed_turns_in_tui(self):
        observed = []

        async def model(messages, info):
            observed.append([p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart)])
            yield "这是"
            yield "回答"

        app = ChatShell(Conversation(Agent(FunctionModel(stream_function=model))))
        async with app.run_test() as pilot:
            self.assertIn("新会话", app.export_screenshot())
            for text in ("第一轮", "第二轮"):
                app.query_one(Prompt).insert(text)
                await pilot.press("enter")
                await app.turn_worker.wait()
                await pilot.pause()
            self.assertTrue(app.conversation.session_id)
            self.assertIn(app.conversation.session_id, app.export_screenshot())
            self.assertEqual(observed, [["第一轮"], ["第一轮", "第二轮"]])
            self.assertEqual([m.content for m in app.query(".message")],
                             ["第一轮", "这是回答", "第二轮", "这是回答"])

    async def test_quit_cleans_up_active_stream(self):
        started, stopped = asyncio.Event(), asyncio.Event()

        async def send(text, on_text, *, on_tool=None):
            started.set()
            try:
                await asyncio.Event().wait()
            finally:
                stopped.set()

        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[], send=send))
        async with app.run_test() as pilot:
            app.query_one(Prompt).insert("耗时请求")
            await pilot.press("enter")
            await started.wait()
            await pilot.press("ctrl+q")
        self.assertTrue(stopped.is_set())

    async def test_toad_theme_and_tool_blocks_follow_agent_event_order(self):
        calls = 0

        def shell(command: str) -> str:
            return "index.html\nREADME.md"

        async def model(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                yield "先检查文件。"
                yield {1: DeltaToolCall(name="shell", json_args='{"command":"ls -la"}')}
            else:
                yield "检查完成。"

        app = ChatShell(Conversation(Agent(FunctionModel(stream_function=model), tools=[shell])))
        async with app.run_test(size=(100, 36)) as pilot:
            self.assertEqual(app.theme, "dracula")
            self.assertEqual(app.screen.styles.background.hex, "#282A36")
            self.assertEqual(app.query_one(PromptContainer).styles.border_top[0], "tall")
            editor = app.query_one(Prompt)
            self.assertTrue(editor.compact)
            editor.insert("**bold**")
            await pilot.pause()
            self.assertTrue(editor.get_line(0).spans)
            editor.clear()
            editor.insert("检查文件")
            await pilot.press("enter")
            await app.turn_worker.wait()
            await pilot.pause()
            blocks = list(app.query_one("#contents").children)
            self.assertEqual([type(block).__name__ for block in blocks],
                             ["UserInput", "AgentResponse", "ToolCall", "AgentResponse"])
            tool = app.query_one(ToolCall)
            self.assertTrue(tool.expanded)
            self.assertTrue(tool.output.has_class("-success"))
            self.assertIn("index.html", app.export_screenshot())
            await pilot.click(ToolCallHeader)
            self.assertFalse(tool.expanded)

    async def test_invalid_tool_args_and_failed_results_do_not_break_display(self):
        app = ChatShell(SimpleNamespace(workspace=Path.cwd(), session_id="demo", history=[]))
        async with app.run_test() as pilot:
            tool = ToolCall(ToolCallPart("shell", "{invalid-json"))
            await app.query_one("#contents").mount(tool)
            tool.finish(ToolReturnPart("shell", "Command rejected", outcome="failed"))
            await pilot.pause()
            self.assertTrue(tool.expanded)
            self.assertTrue(tool.output.has_class("-error"))
            self.assertFalse(tool.output.has_class("-success"))
            self.assertIn("Command", app.export_screenshot())
