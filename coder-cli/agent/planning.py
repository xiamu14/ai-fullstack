"""Approval gate around the native, conversation-scoped Planning store."""
from pydantic import TypeAdapter
from pydantic_ai.exceptions import SkipToolExecution
from pydantic_ai.messages import ToolReturn
from pydantic_ai_harness.planning import PlanItem, render_plan

from agent.permissions.config import digest


GUIDANCE = """Strict planning is required before any side effect, including shell and memory writes.
Research using read_file, list_files and grep; then call write_plan with the full ordered
plan, including scope and verification criteria. That tool presents the actual plan for user
approval. Do not use ask_user_question as a substitute. Even a small change needs a short plan.
Keep exactly the first unfinished step in_progress; completed steps precede it, pending steps
follow it. Preserve step content verbatim when updating progress; put evidence in your response,
not in step descriptions. Preserve step ids when available. Scope, order, or cancellation
changes require renewed approval. After resuming a run, submit the stored plan for approval
again. Plan approval does not override tool permissions. Mark completion only with evidence.
"""


class StrictPlanning:
    def __init__(self, store, interaction):
        self.store = store
        self.interaction = interaction
        self.approved: str | None = None
        self.revision = 0

    def invalidate(self):
        self.approved = None
        self.revision += 1

    @staticmethod
    def fingerprint(items):
        # Native write_plan generates fresh ids when omitted; ids alone do not change scope.
        return digest([(item.content, item.parent_id, item.depends_on,
                        item.status == "cancelled") for item in items])

    async def check(self, name, tool_def):
        if name in {"write_plan", "ask_user_question", "read_memory", "search_memory",
                    "search_conversation_history"}:
            return
        if tool_def.tool_kind in {
            "file_system.read_file", "file_system.list_files", "file_system.grep",
        }:
            return
        items = await self.store.get_items()
        if self.approved != self.fingerprint(items) or not any(item.status == "in_progress" for item in items):
            raise SkipToolExecution("严格规划：先用 write_plan 提交计划并获得批准，再执行当前步骤。")

    async def write(self, args, handler):
        items = TypeAdapter(list[PlanItem]).validate_python(args["items"])
        # Revoke before validation/persistence: a failed replacement cannot retain an old grant.
        if self.fingerprint(items) != self.approved:
            self.invalidate()
        if not items or any(not item.content.strip() for item in items):
            raise SkipToolExecution("计划不能为空，步骤必须说明任务范围与验收条件。")
        states = [item.status for item in items if item.status != "cancelled"]
        remaining = [state for state in states if state != "completed"]
        if (states != ["completed"] * states.count("completed") + remaining
                or remaining and remaining != ["in_progress"] + ["pending"] * (len(remaining) - 1)):
            raise SkipToolExecution("按顺序执行：已完成步骤在前，仅首个未完成步骤为 in_progress，其余为 pending。")
        result = await handler({**args, "items": items})
        stored = await self.store.get_items()
        if stored != items:
            return result
        fingerprint = self.fingerprint(stored)
        if self.approved != fingerprint:
            revision = self.revision
            approved, _ = await self.interaction.approve(
                "严格规划：批准以下完整计划后才能执行；工具权限仍单独检查。\n\n" + render_plan(stored),
                rememberable=False,
            )
            if (approved and fingerprint == self.fingerprint(await self.store.get_items())
                    and revision == self.revision):
                self.approved = fingerprint
            else:
                notice = "计划未批准，保持只读研究阶段。"
                return self.with_notice(result, notice)
        if any(item.status == "in_progress" for item in stored):
            notice = "计划已批准；立即执行当前步骤，无需再次询问计划批准。具体工具权限仍单独检查。"
        else:
            self.invalidate()
            notice = "计划已结束，执行门禁关闭；请汇报验证证据。"
        return self.with_notice(result, notice)

    @staticmethod
    def with_notice(result, notice):
        if isinstance(result, ToolReturn):
            result.return_value = str(result.return_value) + "\n" + notice
            return result
        return str(result) + "\n" + notice
