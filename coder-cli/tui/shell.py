import asyncio
import sqlite3

import httpx
import httpx2
from anyio import BrokenResourceError, ClosedResourceError, EndOfStream
from pydantic_ai.exceptions import AgentRunError
from pydantic_ai.mcp import MCPError
from textual import on, work
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.screen import Screen
from textual.widgets import Footer
from textual.worker import WorkerCancelled

from agent.conversation import Conversation, cache_statistics, error_message
from tui.messages import Conversation as ConversationView
from tui.messages import MessageHistory
from tui.prompt import Prompt, PromptTextArea, StatusLine
from tui.throbber import Throbber
from tui.turn import TurnView, restore_messages


class MainScreen(Screen):
    pass


class ChatShell(App):
    CSS_PATH = ["toad-global.tcss", "toad-conversation.tcss", "toad-prompt.tcss"]
    AUTO_FOCUS = "PromptTextArea"
    BINDINGS = [
        Binding("ctrl+q", "quit", "Quit", priority=True),
        Binding("ctrl+c", "cancel_turn", "Stop", priority=True),
        Binding("escape", "focus_prompt", "Dismiss"),
        Binding("pageup", "history_up", "Scroll up", show=False, priority=True),
        Binding("pagedown", "history_down", "Scroll down", show=False, priority=True),
    ]

    def __init__(self, conversation: Conversation) -> None:
        super().__init__()
        self.theme = "dracula"
        self.conversation = conversation
        self.busy = True
        self.turn_worker = None
        self.pending: list[str] = []

    def get_default_screen(self) -> Screen:
        return MainScreen()

    def compose(self) -> ComposeResult:
        with ConversationView():
            yield Throbber()
            yield MessageHistory()
            yield Prompt(self.conversation.session_id, self.conversation.workspace)
        yield Footer()

    async def on_mount(self) -> None:
        prompt = self.query_one(PromptTextArea)
        prompt.disabled = True
        await restore_messages(self.query_one(MessageHistory), self.conversation.history)
        self.busy = False
        prompt.disabled = False
        prompt.focus()

    @on(PromptTextArea.Submitted)
    async def submitted(self, event: PromptTextArea.Submitted) -> None:
        if self.busy:
            try:
                accepted = self.conversation.feedback(event.text)
            except ValueError as error:
                self.query_one(PromptTextArea).load_text(event.text)
                self.notify(str(error), severity="error")
                return
            await self.query_one(MessageHistory).add("user", event.text)
            if not accepted:
                self.pending.append(event.text)
            self.query_one(StatusLine).update("已接收反馈" if accepted else "已排队")
            return
        await self.query_one(MessageHistory).add("user", event.text)
        self.start_turn(event.text)

    def start_turn(self, text: str) -> None:
        self.busy = self.query_one(PromptTextArea).busy = True
        self.query_one(Throbber).add_class("-busy")
        self.query_one(StatusLine).update("执行中 · Ctrl+C 停止")
        self.turn_worker = self.run_turn(text)

    @work
    async def run_turn(self, prompt: str) -> None:
        history = self.query_one(MessageHistory)
        view = TurnView(history)

        async def question(text: str) -> None:
            await view.question(text)
            self.query_one(StatusLine).update("等待回答 · 输入后按 Enter")
            self.query_one(PromptTextArea).focus()

        try:
            try:
                result = await self.conversation.send(prompt, view.write, on_tool=view.tool_event, on_question=question)
                await view.finish(str(result.output))
                self.query_one(StatusLine).tooltip = "\n".join(cache_statistics(result))
            except* (
                AgentRunError, MCPError, httpx.HTTPError, httpx2.HTTPError, OSError, sqlite3.Error,
                BrokenResourceError, ClosedResourceError, EndOfStream,
            ) as errors:
                await history.add("error", error_message(errors))
        except asyncio.CancelledError:
            if self.is_running:
                await history.add("error", "本轮已停止。已执行的工具操作不会回滚。")
            raise
        finally:
            await view.close()
            if self.is_running:
                self.query_one(StatusLine).update(self.conversation.session_id or "新会话")
                self.busy = self.query_one(PromptTextArea).busy = False
                self.query_one(Throbber).remove_class("-busy")
                self.query_one(PromptTextArea).focus()
                if self.pending:
                    self.start_turn(self.pending.pop(0))

    async def action_quit(self) -> None:
        self.pending.clear()
        if self.busy and self.turn_worker is not None:
            self.turn_worker.cancel()
            try:
                await self.turn_worker.wait()
            except WorkerCancelled:
                pass
        self.exit()

    def action_cancel_turn(self) -> None:
        self.pending.clear()
        if self.busy and self.turn_worker is not None:
            self.turn_worker.cancel()

    def action_focus_prompt(self) -> None:
        self.query_one(PromptTextArea).focus()

    def action_history_up(self) -> None:
        self.query_one(MessageHistory).scroll_page_up()

    def action_history_down(self) -> None:
        self.query_one(MessageHistory).scroll_page_down()
