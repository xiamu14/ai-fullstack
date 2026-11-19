# Toad ToolCall / TerminalTool presentation, without ACP or shell execution.
# See TOAD-NOTICE.md and TOAD-LICENSE.txt.
import json

from textual import events, on
from textual.containers import VerticalGroup
from textual.content import Content
from textual.widgets import Static


def pill(text: Content | str, background: str, foreground: str) -> Content:
    """Format text as a pill (half block ends).

    Args:
        text: Pill contents as Content object or text.
        background: Background color.
        foreground: Foreground color.

    Returns:
        Pill content.
    """
    content = Content(text) if isinstance(text, str) else text
    main_style = f"{foreground} on {background}"
    end_style = f"{background} on transparent r"
    pill_content = Content.assemble(
        ("▌", end_style),
        content.stylize(main_style),
        ("▐", end_style),
    )
    return pill_content


class TextContent(Static):
    DEFAULT_CSS = "TextContent { height: auto; }"


class Terminal(Static):
    pass


class TerminalTool(Terminal):
    DEFAULT_CSS = "TerminalTool { height: auto; border: panel $text-primary; }"


class ToolCallHeader(Static):
    ALLOW_SELECT = False
    DEFAULT_CSS = """
    ToolCallHeader {
        width: auto;
        max-width: 1fr;
        &:hover { background: $panel; }
    }
    """


class ToolCall(VerticalGroup):
    def __init__(self, part) -> None:
        super().__init__(classes="block")
        self.tool_call_id = part.tool_call_id
        self.tool_name = part.tool_name
        try:
            args = part.args_as_dict()
        except ValueError:
            args = {}
        self.title = str(args.get("command") or args.get("path") or part.tool_name)
        self.status = "in_progress"
        self.expanded = False
        self.has_content = False
        self.output = TerminalTool("", markup=False) if part.tool_name == "shell" else TextContent("", markup=False)
        if isinstance(self.output, TerminalTool):
            self.output.border_title = self.title

    @property
    def header(self) -> Content:
        if self.has_content:
            expand_icon = Content.from_markup("[$text-secondary]▼ " if self.expanded else "[$text-secondary]▶ ")
        else:
            expand_icon = Content.from_markup("[$text-secondary 30%]▶ ")
        header = Content.assemble(expand_icon, "🔧 ", self.title)
        if self.status == "completed":
            header += Content.from_markup(" [$success]✔")
        elif self.status == "failed":
            header += Content.assemble(" ", pill("failed", "$error-muted", "$error"))
        return header

    def compose(self):
        yield ToolCallHeader(self.header, markup=False)
        with VerticalGroup(id="tool-content"):
            yield self.output

    def finish(self, part) -> None:
        value = part.content
        text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2, default=str)
        self.status = "completed" if part.outcome == "success" else "failed"
        self.has_content = bool(text)
        self.expanded = self.tool_name == "shell" or self.status == "failed"
        self.set_class(self.has_content, "-has-content")
        self.set_class(self.expanded, "-expanded")
        self.output.update(text)
        self.output.set_class(self.status == "completed", "-success")
        self.output.set_class(self.status == "failed", "-error")
        self.query_one(ToolCallHeader).update(self.header)

    @on(events.Click, "ToolCallHeader")
    def toggle(self) -> None:
        if self.has_content:
            self.expanded = not self.expanded
            self.set_class(self.expanded, "-expanded")
            self.query_one(ToolCallHeader).update(self.header)
