"""Toad SlashComplete structure for local Skill selection; see TOAD-NOTICE.md."""
from dataclasses import dataclass

from textual import on
from textual.binding import Binding
from textual.containers import VerticalGroup
from textual.content import Content
from textual.message import Message
from textual.widgets import Input, OptionList
from textual.widgets.option_list import Option


class SlashCompleteInput(Input):
    pass


class SlashComplete(VerticalGroup):
    BINDINGS = [
        Binding("up", "cursor_up", "Cursor up", priority=True),
        Binding("down", "cursor_down", "Cursor down", priority=True),
        Binding("enter", "submit", "Insert /skill", priority=True),
        Binding("escape", "dismiss", "Dismiss", priority=True),
    ]
    DEFAULT_CSS = "SlashComplete { OptionList { height: auto; } }"

    @dataclass
    class Completed(Message):
        name: str

    class Dismissed(Message):
        pass

    def __init__(self):
        super().__init__()
        self.skills: list[tuple[str, str]] = []

    def compose(self):
        yield SlashCompleteInput(compact=True, placeholder="search skills")
        yield OptionList()

    def show_skills(self, skills: list[tuple[str, str]]) -> None:
        self.skills = list(skills)
        self.query_one(Input).value = ""
        self.filter_skills("")
        self.query_one(Input).focus()

    @on(Input.Changed)
    def changed(self, event: Input.Changed) -> None:
        event.stop()
        self.filter_skills(event.value)

    def filter_skills(self, text: str) -> None:
        text = text.lstrip("/").casefold().strip()
        options = [
            Option(Content.styled(f"/{name}", "$text-success") + Content.styled(f"  {description}", "dim"), id=name)
            for name, description in self.skills if text in name.casefold() or text in description.casefold()
        ]
        option_list = self.query_one(OptionList)
        option_list.set_options(options)
        option_list.highlighted = 0 if options else None

    def action_cursor_up(self) -> None:
        self.query_one(OptionList).action_cursor_up()

    def action_cursor_down(self) -> None:
        self.query_one(OptionList).action_cursor_down()

    def action_submit(self) -> None:
        option = self.query_one(OptionList).highlighted_option
        if option is not None:
            self.post_message(self.Completed(option.id))

    @on(OptionList.OptionSelected)
    def selected(self, event: OptionList.OptionSelected) -> None:
        event.stop()
        self.post_message(self.Completed(event.option_id))

    def action_dismiss(self) -> None:
        self.post_message(self.Dismissed())
