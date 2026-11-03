# Toad prompt structure; see TOAD-NOTICE.md.
from pathlib import Path

from textual.containers import HorizontalGroup, VerticalGroup
from textual.widgets import Label
from textual.binding import Binding
from textual.message import Message
from tui.highlighted_textarea import HighlightedTextArea


class PromptTextArea(HighlightedTextArea):
    BINDINGS = [
        Binding("enter", "submit", "Send", key_display="⏎", priority=True),
        Binding("ctrl+j,shift+enter", "newline", "Line", key_display="⇧+⏎"),
        Binding("alt+up", "previous", "上一条输入"),
        Binding("alt+down", "next", "下一条输入"),
    ]

    class Submitted(Message):
        def __init__(self, text: str) -> None:
            super().__init__()
            self.text = text

    def __init__(self) -> None:
        super().__init__(
            soft_wrap=True, show_line_numbers=False, highlight_cursor_line=False,
            placeholder="How can I help you today?",
        )
        self.inputs: list[str] = []
        self.history_index = 0
        self.draft = ""
        self.busy = False

    def action_submit(self) -> None:
        if self.busy or not self.text.strip():
            return
        text = self.text
        self.inputs.append(text)
        self.history_index = len(self.inputs)
        self.draft = ""
        self.clear()
        self.post_message(self.Submitted(text))

    def action_newline(self) -> None:
        self.insert("\n")

    def action_previous(self) -> None:
        if self.history_index == len(self.inputs):
            self.draft = self.text
        if self.history_index > 0:
            self.history_index -= 1
            self.load_text(self.inputs[self.history_index])
            self.move_cursor(self.document.end)

    def action_next(self) -> None:
        if self.history_index < len(self.inputs):
            self.history_index += 1
            text = self.draft if self.history_index == len(self.inputs) else self.inputs[self.history_index]
            self.load_text(text)
            self.move_cursor(self.document.end)


class PromptContainer(HorizontalGroup):
    pass


class AgentInfo(Label):
    pass


class CondensedPath(Label):
    pass


class StatusLine(Label):
    pass


class ModeInfo(Label):
    pass


class Prompt(VerticalGroup):
    def __init__(self, session_id: str | None) -> None:
        super().__init__(classes="-has-mode")
        self.session_id = session_id

    def compose(self):
        with PromptContainer(id="prompt-container"):
            with HorizontalGroup(id="text-prompt"):
                yield Label("❯", id="prompt", markup=False)
                yield PromptTextArea()
        with HorizontalGroup(id="info-container"):
            yield AgentInfo("coder-cli", markup=False)
            yield CondensedPath(str(Path("workspace").resolve()).replace(str(Path.home()), "~", 1), markup=False)
            yield StatusLine(self.session_id or "新会话", id="session", markup=False)
            yield ModeInfo("Default")
