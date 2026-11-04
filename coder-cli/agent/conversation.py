import os
from collections.abc import Awaitable, Callable
from contextlib import AsyncExitStack
from copy import deepcopy
from pathlib import Path

from pydantic_ai import Agent, RunContext, UsageLimits
from pydantic_ai.models import AbstractModel
from pydantic_ai.usage import RunUsage
from pydantic_ai.workspaces import LocalWorkspaceBackend
from pydantic_ai_harness import Skills
from pydantic_ai_harness.skills import SkillCatalog
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

from agent.interaction import Interaction
from integrations.mcp import MCPRegistry


class SkillInvocationError(ValueError):
    pass


class Conversation:
    def __init__(
        self, agent: Agent, session_id: str | None = None, *, history: list[ModelMessage] | None = None,
        workspace: Path | None = None,
        mcp: MCPRegistry | None = None,
        skills: Skills | None = None,
        interaction: Interaction | None = None,
        history_loader: Callable[[str], Awaitable[list[ModelMessage]]] | None = None,
    ) -> None:
        self.agent = agent
        self.session_id = session_id
        self.workspace = (workspace if workspace is not None else Path.cwd()).resolve()
        self.history: list[ModelMessage] = history if history is not None else []
        self.mcp = mcp
        self.skills = skills
        self.interaction = interaction or Interaction()
        self.history_loader = history_loader
        self.restore_required = False

    def feedback(self, text: str) -> bool:
        return self.interaction.feedback(text)

    @property
    def context_window_used(self) -> float | None:
        if self.interaction.context is not None:
            return self.interaction.context.context_window_used
        model = self.agent.model
        if not isinstance(model, AbstractModel):
            return None
        return RunContext(
            deps=None, model=model, usage=RunUsage(), messages=self.history,
        ).context_window_used

    async def skill_catalog(self) -> SkillCatalog:
        if self.skills is None:
            return SkillCatalog(skills=(), skipped=())
        try:
            return await self.skills.load(LocalWorkspaceBackend(self.workspace))
        except ValueError as exc:
            raise SkillInvocationError(f"技能目录加载失败：{exc}") from exc

    async def send(
        self, prompt: str,
        on_text: Callable[[str], Awaitable[None]] | None = None,
        *, on_tool: Callable[[FunctionToolCallEvent | FunctionToolResultEvent], Awaitable[None]] | None = None,
        on_question: Callable[[str], Awaitable[None]] | None = None,
        skill_name: str | None = None,
    ):
        if skill_name is not None:
            catalog = await self.skill_catalog()
            skill = next((skill for skill in catalog.skills if skill.name == skill_name), None)
            if skill is None:
                raise SkillInvocationError(f"技能不可用：{skill_name}；请重新选择。")
            if not skill.user_invocable:
                raise SkillInvocationError(f"技能不允许主动调用：{skill_name}")
            prompt = skill.render(prompt)
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

        self.interaction.open(on_question)
        try:
            if self.restore_required and self.history_loader is not None and self.session_id is not None:
                self.history = await self.history_loader(self.session_id)
            self.restore_required = True
            async with AsyncExitStack() as stack:
                toolsets = await stack.enter_async_context(self.mcp.toolsets()) if self.mcp else []
                result = await self.agent.run(
                    prompt,
                    conversation_id=self.session_id,
                    message_history=deepcopy(self.history),
                    toolsets=toolsets, capabilities=[self.interaction],
                    usage_limits=UsageLimits(request_limit=50),
                    model_settings={"timeout": 30},
                    event_stream_handler=handle_events if on_text or on_tool else None,
                )
        finally:
            self.interaction.close()
        # 仅提交成功轮次；压缩后的原生消息取代旧历史，不能重复追加。
        self.session_id = result.conversation_id
        self.history = result.all_messages()
        self.restore_required = False
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
