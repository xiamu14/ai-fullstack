import asyncio
import subprocess
import sys

from rich.text import Text
from textual import on
from textual.app import App, ComposeResult
from textual.containers import Center, HorizontalGroup, VerticalGroup
from textual.screen import ModalScreen
from textual.widgets import Button, DataTable, Markdown

from storage.sessions import SessionInfo


class SessionResumeModal(ModalScreen):
    """Toad session table structure, adapted to browsing and copying only."""

    CSS_PATH = "toad-sessions.tcss"
    BINDINGS = [("c", "copy_id", "Copy sessionId"), ("escape,q", "close", "Close")]

    def __init__(self, sessions: list[SessionInfo]) -> None:
        super().__init__()
        self.sessions = sessions

    def compose(self) -> ComposeResult:
        with VerticalGroup(id="container"):
            yield Markdown("# Sessions\n\n↑ / ↓ 选择会话 · C 复制完整 sessionId · Esc 退出")
            with Center(id="table-container"):
                yield DataTable(id="sessions", cursor_type="row")
            with HorizontalGroup(id="buttons"):
                yield Button("Copy sessionId", id="copy", variant="primary")
                yield Button("Close", id="close")

    def on_mount(self) -> None:
        table = self.query_one(DataTable)
        table.add_columns("sessionId", "title")
        for session in self.sessions:
            table.add_row(Text(session.session_id), Text(session.title))
        table.focus()
        self.query_one("#copy", Button).disabled = not self.sessions

    @on(Button.Pressed, "#copy")
    async def action_copy_id(self) -> None:
        table = self.query_one(DataTable)
        if not self.sessions or table.cursor_row >= len(self.sessions):
            return
        session_id = self.sessions[table.cursor_row].session_id
        try:
            if sys.platform == "darwin":
                await asyncio.to_thread(
                    subprocess.run, ["/usr/bin/pbcopy"], input=session_id,
                    text=True, check=True, timeout=5,
                )
                self.notify("已复制 sessionId")
            else:
                self.app.copy_to_clipboard(session_id)
                self.notify("已向终端发送复制请求（OSC 52）")
        except (OSError, subprocess.SubprocessError) as exc:
            self.notify(f"复制失败：{exc}", severity="error")

    @on(Button.Pressed, "#close")
    def action_close(self) -> None:
        self.app.exit()


class SessionsApp(App):
    def __init__(self, sessions: list[SessionInfo]) -> None:
        super().__init__()
        self.theme = "dracula"
        self.sessions = sessions

    def on_mount(self) -> None:
        self.push_screen(SessionResumeModal(self.sessions))
