# Toad TUI structure adapted for Pydantic AI; see TOAD-NOTICE.md.
from rich.segment import Segment
from textual.containers import Grid, HorizontalGroup, Vertical, VerticalGroup, VerticalScroll
from textual.layouts.grid import GridLayout
from textual.geometry import Spacing
from textual.strip import Strip
from textual.widgets import Label, Markdown


class UserInput(HorizontalGroup):
    def __init__(self, content: str) -> None:
        super().__init__(classes="block message user")
        self.content = content
        self.body = Markdown(content)

    def compose(self):
        yield Label("❯", id="prompt", markup=False)
        yield self.body


class AgentResponse(Markdown):
    def __init__(self, content: str = "") -> None:
        super().__init__(content, classes="block message assistant")
        self.content = content
        self.body = self


class MarkdownNote(Markdown):
    def __init__(self, content: str) -> None:
        super().__init__(content, classes="block message error -error")
        self.content = content


class Contents(VerticalGroup):
    def process_layout(self, placements):
        if placements:
            last_placement = placements[-1]
            top, right, _bottom, left = last_placement.margin
            placements[-1] = last_placement._replace(margin=Spacing(top, right, 0, left))
        return placements


class ContentsGrid(Grid):
    def pre_layout(self, layout) -> None:
        assert isinstance(layout, GridLayout)
        layout.stretch_height = True


class CursorContainer(Vertical):
    def render_lines(self, crop) -> list[Strip]:
        rich_style = self.visual_style.rich_style
        strips = [Strip([Segment("▌", rich_style)], cell_length=1)] * crop.height
        if crop.y == 0 and strips:
            strips[0] = Strip([Segment(" ", rich_style)], cell_length=1)
        return strips


class Window(VerticalScroll):
    pass


class MessageHistory(Window):
    def __init__(self) -> None:
        super().__init__(id="history")
        self.anchor()

    def compose(self):
        with ContentsGrid():
            yield CursorContainer(id="cursor-container")
            yield Contents(id="contents")

    async def add(self, role: str, content: str = ""):
        message = {"user": UserInput, "assistant": AgentResponse, "error": MarkdownNote}[role](content)
        await self.query_one(Contents).mount(message)
        return message


class Conversation(Vertical):
    pass
