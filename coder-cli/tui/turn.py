from pydantic_ai.messages import (
    FunctionToolCallEvent, FunctionToolResultEvent, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart,
)

from tui.messages import MessageHistory
from tui.tools import ToolCall


class TurnView:
    """Render text and tool results in the order emitted by the Agent."""

    def __init__(self, history: MessageHistory) -> None:
        self.history = history
        self.response = None
        self.stream = None
        self.tools: dict[str, ToolCall] = {}

    async def write(self, text: str) -> None:
        if not text:
            return
        if self.response is None:
            self.response = await self.history.add("assistant")
            self.stream = self.response.get_stream(self.response)
        self.response.content += text
        await self.stream.write(text)

    async def tool_event(self, event) -> None:
        if isinstance(event, FunctionToolCallEvent):
            await self.close()
            self.response = None
            tool = ToolCall(event.part)
            self.tools[event.tool_call_id] = tool
            await self.history.query_one("#contents").mount(tool)
        elif tool := self.tools.get(event.tool_call_id):
            tool.finish(event.part)

    async def finish(self, text: str) -> None:
        if self.response is None:
            await self.write(text)
        await self.close()
        if self.response is not None:
            self.response.content = text
            await self.response.update(text)

    async def close(self) -> None:
        if self.stream is not None:
            await self.stream.stop()
            self.stream = None


async def restore_messages(history: MessageHistory, messages) -> None:
    view = TurnView(history)
    try:
        for message in messages:
            for part in message.parts:
                if isinstance(part, UserPromptPart) and isinstance(part.content, str):
                    await view.close()
                    view.response = None
                    await history.add("user", part.content)
                elif isinstance(part, TextPart):
                    await view.write(part.content)
                elif isinstance(part, ToolCallPart):
                    await view.tool_event(FunctionToolCallEvent(part=part))
                elif isinstance(part, ToolReturnPart):
                    await view.tool_event(FunctionToolResultEvent(part=part))
    finally:
        await view.close()
