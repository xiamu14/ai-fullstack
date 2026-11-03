import os
from collections.abc import Awaitable, Callable
from copy import deepcopy
from pathlib import Path

from pydantic_ai import Agent, UsageLimits
from pydantic_ai.messages import (
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    ModelMessage,
    ModelResponse,
    PartDeltaEvent,
    PartStartEvent,
    TextPart,
    TextPartDelta,
)


class Conversation:
    def __init__(
        self, agent: Agent, session_id: str | None = None, *, history: list[ModelMessage] | None = None,
        workspace: Path | None = None,
    ) -> None:
        self.agent = agent
        self.session_id = session_id
        self.workspace = (workspace if workspace is not None else Path.cwd()).resolve()
        self.history: list[ModelMessage] = history if history is not None else []

    async def send(
        self, prompt: str,
        on_text: Callable[[str], Awaitable[None]] | None = None,
        *, on_tool: Callable[[FunctionToolCallEvent | FunctionToolResultEvent], Awaitable[None]] | None = None,
    ):
        if not prompt.strip():
            raise ValueError("消息不能为空")

        async def handle_events(ctx, events):
            async for event in events:
                if on_tool and isinstance(event, (FunctionToolCallEvent, FunctionToolResultEvent)):
                    await on_tool(event)
                if on_text is None:
                    continue
                if isinstance(event, PartStartEvent) and isinstance(event.part, TextPart):
                    await on_text(event.part.content)
                elif isinstance(event, PartDeltaEvent) and isinstance(event.delta, TextPartDelta):
                    await on_text(event.delta.content_delta)

        result = await self.agent.run(
            prompt,
            conversation_id=self.session_id,
            message_history=deepcopy(self.history),
            usage_limits=UsageLimits(request_limit=10),
            model_settings={"timeout": 30},
            event_stream_handler=handle_events if on_text or on_tool else None,
        )
        # 仅提交成功轮次；压缩后的原生消息取代旧历史，不能重复追加。
        self.session_id = result.conversation_id
        self.history = result.all_messages()
        return result


def error_message(exc: Exception) -> str:
    if isinstance(exc, ExceptionGroup):
        return "\n".join(error_message(error) for error in exc.exceptions)
    message = f"任务未完成（{type(exc).__name__}）：{exc}"
    for name in ("OPENAI_API_KEY", "LOGFIRE_TOKEN"):
        if token := os.getenv(name):
            message = message.replace(token, "***")
    return message


def cache_statistics(result) -> list[str]:
    rows = []
    responses = (m for m in result.new_messages() if isinstance(m, ModelResponse))
    for index, message in enumerate(responses, start=1):
        usage = message.usage
        rows.append(
            f"[cache 请求 {index}] 输入={usage.input_tokens} 读取={usage.cache_read_tokens} "
            f"写入={usage.cache_write_tokens} 缓存输入占比={usage.cache_hit_ratio:.1%}"
        )
    usage = result.usage
    # 缓存读写均包含在输入内；0 也可能是兼容接口未报告统计。
    rows.append(
        f"[cache 总计] 请求={usage.requests} 输入={usage.input_tokens} "
        f"读取={usage.cache_read_tokens} 写入={usage.cache_write_tokens} "
        f"缓存输入占比={usage.cache_hit_ratio:.1%}"
    )
    return rows
