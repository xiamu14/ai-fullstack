import asyncio
import sqlite3
import subprocess
import sys

from rich.text import Text
from textual import on
from textual.app import App, ComposeResult
from textual.containers import Center, HorizontalGroup, VerticalGroup
from textual.screen import ModalScreen
from textual.widgets import Button, DataTable, Markdown

from storage.sessions import SessionInfo, delete_session, session_database


class SessionResumeModal(ModalScreen):
    """Toad session table structure with local session operations."""

    CSS_PATH = "toad-sessions.tcss"
    BINDINGS = [("c", "copy_id", "Copy sessionId"), ("d", "delete_session", "Delete session"), ("escape,q", "close", "Close")]

    def __init__(self, sessions: list[SessionInfo]) -> None:
        super().__init__()
        self.sessions = sessions
        self.deleting = False

    def compose(self) -> ComposeResult:
        with VerticalGroup(id="container"):
            yield Markdown("# Sessions\n\n↑ / ↓ 选择会话 · C 复制 sessionId · D 删除会话 · Esc 退出")
            with Center(id="table-container"):
                yield DataTable(id="sessions", cursor_type="row")
            with HorizontalGroup(id="buttons"):
                yield Button("Copy sessionId", id="copy", variant="primary")
                yield Button("Close", id="close")

    def on_mount(self) -> None:
        table = self.query_one(DataTable)
        table.add_columns("sessionId", "title", "workspace")
        for session in self.sessions:
            short_id = session.session_id if len(session.session_id) <= 16 else f"{session.session_id[:8]}…{session.session_id[-4:]}"
            table.add_row(Text(short_id), Text(session.title), Text(session.workspace or "—"), key=session.session_id)
        table.focus()
        self.query_one("#copy", Button).disabled = not self.sessions

    @on(Button.Pressed, "#copy")
    async def action_copy_id(self) -> None:
        table = self.query_one(DataTable)
        if self.deleting or not self.sessions or table.cursor_row >= len(self.sessions):
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

    async def action_delete_session(self) -> None:
        table = self.query_one(DataTable)
        index = table.cursor_row
        if self.deleting or not 0 <= index < len(self.sessions):
            return
        session = self.sessions[index]
        self.deleting = True
        try:
            await delete_session(session_database(), session.session_id)
        except (OSError, sqlite3.Error, ValueError) as exc:
            self.notify(f"删除失败：{exc}", severity="error")
        else:
            self.sessions.pop(index)
            table.remove_row(session.session_id)
            if self.sessions:
                table.move_cursor(row=min(index, len(self.sessions) - 1))
            self.query_one("#copy", Button).disabled = not self.sessions
            self.notify("已删除会话")
        finally:
            self.deleting = False

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
