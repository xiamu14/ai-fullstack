# Toad prompt structure; see TOAD-NOTICE.md.
from pathlib import Path

from textual import on
from textual.containers import HorizontalGroup, VerticalGroup
from textual.widgets import Label, TextArea
from textual.binding import Binding
from textual.message import Message
from tui.highlighted_textarea import HighlightedTextArea
from tui.skills import SlashComplete


class PromptTextArea(HighlightedTextArea):
    BINDINGS = [
        Binding("enter", "submit", "Send", key_display="⏎", priority=True),
        Binding("ctrl+j,shift+enter", "newline", "Line", key_display="⇧+⏎"),
        Binding("alt+up", "previous", "上一条输入"),
        Binding("alt+down", "next", "下一条输入"),
    ]

    class Submitted(Message):
        def __init__(self, text: str, skill_name: str | None = None) -> None:
            super().__init__()
            self.text = text
            self.skill_name = skill_name

    class SkillsRequested(Message):
        pass

    def __init__(self) -> None:
        super().__init__(
            soft_wrap=True, show_line_numbers=False, highlight_cursor_line=False,
            placeholder="How can I help you today?",
        )
        self.inputs: list[str] = []
        self.history_index = 0
        self.draft = ""
        self.draft_skill_name: str | None = None
        self.busy = False
        self.skill_name: str | None = None
        self.input_skills: list[str | None] = []

    @on(TextArea.Changed)
    def changed(self) -> None:
        if self.skill_name and not self.text.startswith(f"/{self.skill_name} "):
            self.skill_name = None
        if self.text == "/" and not self.busy:
            self.post_message(self.SkillsRequested())

    def action_submit(self) -> None:
        if not self.text.strip():
            return
        text = self.text
        self.inputs.append(text)
        skill_name = self.skill_name
        self.input_skills.append(skill_name)
        self.history_index = len(self.inputs)
        self.draft = ""
        self.draft_skill_name = None
        self.clear()
        self.skill_name = None
        self.post_message(self.Submitted(text, skill_name))

    def action_newline(self) -> None:
        self.insert("\n")

    def action_previous(self) -> None:
        if self.history_index == len(self.inputs):
            self.draft = self.text
            self.draft_skill_name = self.skill_name
        if self.history_index > 0:
            self.history_index -= 1
            self.load_text(self.inputs[self.history_index])
            self.skill_name = self.input_skills[self.history_index]
            self.move_cursor(self.document.end)

    def action_next(self) -> None:
        if self.history_index < len(self.inputs):
            self.history_index += 1
            text = self.draft if self.history_index == len(self.inputs) else self.inputs[self.history_index]
            self.load_text(text)
            self.skill_name = self.input_skills[self.history_index] if self.history_index < len(self.inputs) else self.draft_skill_name
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
    def __init__(self, session_id: str | None, workspace: Path) -> None:
        super().__init__(classes="-has-mode")
        self.session_id = session_id
        self.workspace = workspace

    def compose(self):
        with PromptContainer(id="prompt-container"):
            with HorizontalGroup(id="text-prompt"):
                yield Label("❯", id="prompt", markup=False)
                yield PromptTextArea()
        with HorizontalGroup(id="info-container"):
            yield AgentInfo("coder-cli", markup=False)
            home = Path.home()
            display_path = "~" if self.workspace == home else f"~/{self.workspace.relative_to(home)}" if self.workspace.is_relative_to(home) else str(self.workspace)
            yield CondensedPath(display_path, markup=False)
            yield StatusLine(self.session_id or "新会话", id="session", markup=False)
            yield ModeInfo("Default")
        yield SlashComplete()
