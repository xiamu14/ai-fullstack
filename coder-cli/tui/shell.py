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

from agent.conversation import Conversation, SkillInvocationError, cache_statistics, error_message
from agent.permissions.config import PermissionConfigError
from tui.messages import Conversation as ConversationView
from tui.messages import MessageHistory
from tui.prompt import ModeInfo, Prompt, PromptTextArea, StatusLine
from tui.skills import SlashComplete
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
        self.update_context()
        self.set_interval(0.5, self.update_context)
        self.busy = False
        prompt.disabled = False
        prompt.focus()

    def update_context(self) -> None:
        for label in self.query(ModeInfo):
            label.show_context(getattr(self.conversation, "context_window_used", None))

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
        text = event.text.removeprefix(f"/{event.skill_name} ") if event.skill_name else event.text
        self.start_turn(text, skill_name=event.skill_name)

    @on(PromptTextArea.SkillsRequested)
    async def show_skills(self) -> None:
        if self.busy:
            return
        try:
            catalog = await self.conversation.skill_catalog()
        except (SkillInvocationError, OSError) as error:
            self.notify(str(error), severity="error")
            return
        for skipped in catalog.skipped:
            self.notify(skipped.message, severity="warning")
        skills = [(skill.name, skill.description) for skill in catalog.skills if skill.user_invocable]
        prompt = self.query_one(PromptTextArea)
        if self.busy or prompt.text != "/":
            return
        if not skills:
            self.notify("没有可主动调用的技能", severity="warning")
            return
        self.query_one(Prompt).add_class("-show-slash-complete")
        self.query_one(SlashComplete).show_skills(skills)

    @on(SlashComplete.Completed)
    def skill_selected(self, event: SlashComplete.Completed) -> None:
        prompt = self.query_one(PromptTextArea)
        prompt.load_text(f"/{event.name} ")
        prompt.skill_name = event.name
        prompt.move_cursor(prompt.document.end)
        self.action_focus_prompt()

    @on(SlashComplete.Dismissed)
    def dismiss_skills(self) -> None:
        self.action_focus_prompt()

    def start_turn(self, text: str, *, skill_name: str | None = None) -> None:
        self.busy = self.query_one(PromptTextArea).busy = True
        self.query_one(Throbber).add_class("-busy")
        self.query_one(StatusLine).update("执行中 · Ctrl+C 停止")
        self.turn_worker = self.run_turn(text, skill_name=skill_name)

    @work
    async def run_turn(self, prompt: str, *, skill_name: str | None = None) -> None:
        history = self.query_one(MessageHistory)
        view = TurnView(history)

        async def question(text: str) -> None:
            await view.question(text)
            self.query_one(StatusLine).update("等待回答 · 输入后按 Enter")
            self.query_one(PromptTextArea).focus()

        try:
            try:
                skill_args = {"skill_name": skill_name} if skill_name is not None else {}
                result = await self.conversation.send(prompt, view.write, on_tool=view.tool_event, on_question=question, **skill_args)
                await view.finish(str(result.output))
                self.query_one(StatusLine).tooltip = "\n".join(cache_statistics(result))
            except* (
                AgentRunError, MCPError, SkillInvocationError, PermissionConfigError, httpx.HTTPError, httpx2.HTTPError, OSError, sqlite3.Error,
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
                self.update_context()
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
        self.query_one(Prompt).remove_class("-show-slash-complete")
        self.query_one(PromptTextArea).focus()

    def action_history_up(self) -> None:
        self.query_one(MessageHistory).scroll_page_up()

    def action_history_down(self) -> None:
        self.query_one(MessageHistory).scroll_page_down()
