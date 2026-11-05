import asyncio
from contextlib import chdir
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

from pydantic_ai.exceptions import SkipToolExecution
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness.planning import PlanItem, SqlitePlanStore

from agent.runtime import create_agent
from integrations.mcp import Config, MCPRegistry, Server
from storage.sessions import delete_session
from tests.test_resume import runtime_model


def plan(status="in_progress", content="创建 probe.txt 并核对内容"):
    return ToolCallPart("write_plan", {"items": [{"id": "step", "content": content, "status": status}]})


def write(content="ok"):
    return ToolCallPart("write_file", {"path": "probe.txt", "content": content})


class PlanningTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.directory = self.enterContext(TemporaryDirectory())
        self.enterContext(chdir(self.directory))
        self.questions = []
        self.observed = []

    async def run_parts(self, parts, answers=(), session=None):
        replies, choices = iter(parts), iter(answers)
        def model(messages, info):
            self.observed.append(messages[:])
            return ModelResponse(parts=[next(replies)])
        async def answer(question):
            self.questions.append(question)
            conversation.feedback(next(choices))
        with runtime_model(FunctionModel(model)):
            conversation = await create_agent(session)
            await conversation.send("执行测试任务", on_question=answer)
        return conversation

    async def test_unapproved_full_mode_denies_writes_shell_memory_and_external(self):
        from agent.permissions.config import Settings
        with patch("agent.permissions.policy.load_settings", return_value=(Settings(mode="full"), "v")):
            await self.run_parts([
                write(), ToolCallPart("shell", {"command": "touch shell-probe"}),
                ToolCallPart("write_memory", {"content": "must not save"}), TextPart("done"),
            ])
        self.assertFalse(Path("probe.txt").exists())
        self.assertFalse(Path("shell-probe").exists())
        self.assertFalse(self.questions)
        results = [p for m in self.observed[-1] for p in m.parts if isinstance(p, ToolReturnPart)]
        self.assertEqual(sum("严格规划" in str(p.content) for p in results), 3)

    async def test_approval_progress_replacement_and_resume(self):
        conversation = await self.run_parts([
            plan(), write(), plan("completed"),
            plan(content="替换范围：改写 probe.txt"), write("forbidden"), TextPart("done"),
        ], ["本次允许", "拒绝"])
        self.assertEqual(Path("probe.txt").read_text(), "ok")
        self.assertEqual(len(self.questions), 2)
        results = [p for m in self.observed[-1] for p in m.parts if isinstance(p, ToolReturnPart)]
        self.assertTrue(any("计划已批准" in str(p.content) for p in results))
        self.assertTrue(any(p.metadata and "plan" in p.metadata for p in results))
        self.assertIn("创建 probe.txt", self.questions[0])
        session = conversation.session_id
        store = SqlitePlanStore(str(Path("workspace/sessions.db")), session=session)
        self.assertEqual((await store.get_items())[0].content, "替换范围：改写 probe.txt")
        await self.run_parts([write("not approved on resume"), TextPart("done")], session=session)
        self.assertEqual(Path("probe.txt").read_text(), "ok")
        await delete_session(Path("workspace/sessions.db"), session)
        self.assertEqual(await store.get_items(), [])

    async def test_rejection_custom_answer_and_cancellation_stay_closed(self):
        for choice in ("拒绝", "sounds fine"):
            conversation = await self.run_parts([plan(), write(), TextPart("done")], [choice])
            self.assertIsNone(conversation.planning.approved)
            self.assertFalse(Path("probe.txt").exists())
        with runtime_model(FunctionModel(lambda m, i: ModelResponse(parts=[plan()]))):
            conversation = await create_agent()
            async def cancel(question):
                raise asyncio.CancelledError
            with self.assertRaises(asyncio.CancelledError):
                await conversation.send("plan", on_question=cancel)
            self.assertIsNone(conversation.planning.approved)
            self.assertEqual(len(await conversation.planning.store.get_items()), 1)

    async def test_plan_approval_does_not_override_tool_denial_or_session_scope(self):
        from agent.permissions.config import Rule, Settings
        settings = Settings(rules=[Rule(tool="write_file", action="deny")])
        with patch("agent.permissions.policy.load_settings", return_value=(settings, "v")):
            conversation = await self.run_parts([plan(), write(), TextPart("done")], ["本次允许"])
        self.assertFalse(Path("probe.txt").exists())
        other = SqlitePlanStore(str(Path("workspace/sessions.db")), session="other")
        self.assertEqual(await other.get_items(), [])
        self.assertEqual(len(await conversation.planning.store.get_items()), 1)

    async def test_approval_rechecks_plan_changed_during_wait(self):
        conversation = await self.run_parts([TextPart("ready")])
        gate = conversation.planning
        items = [PlanItem(id="step", content="original", status="in_progress")]
        async def save(args):
            await gate.store.set_items(args["items"])
            return "saved"
        async def approve(*args, **kwargs):
            await gate.store.set_items([PlanItem(id="step", content="changed", status="in_progress")])
            return True, False
        with patch.object(gate.interaction, "approve", side_effect=approve):
            await gate.write({"items": items}, save)
        self.assertIsNone(gate.approved)

    async def test_completed_plan_closes_gate_and_next_write_is_blocked(self):
        conversation = await self.run_parts([
            plan(), write(), plan("completed"), write("after completion"), TextPart("done"),
        ], ["本次允许"])
        self.assertEqual(Path("probe.txt").read_text(), "ok")
        self.assertIsNone(conversation.planning.approved)
        self.assertEqual(len(self.questions), 1)

    async def test_generated_ids_do_not_reapprove_progress(self):
        def update(status):
            return ToolCallPart("write_plan", {"items": [{"content": "create and verify", "status": status}]})
        await self.run_parts([update("in_progress"), write(), update("completed"), TextPart("done")], ["本次允许"])
        self.assertEqual(len(self.questions), 1)

    async def test_sequential_states_and_feedback_invalidate(self):
        conversation = await self.run_parts([plan(), TextPart("done")], ["本次允许"])
        gate = conversation.planning
        handler = AsyncMock()
        with self.assertRaises(SkipToolExecution):
            await gate.write({"items": [PlanItem(content="a"), PlanItem(content="b", status="in_progress")]}, handler)
        handler.assert_not_called()
        self.assertIsNone(gate.approved)
        conversation.feedback("改为另外一个任务")
        self.assertIsNone(gate.approved)
        with self.assertRaises(SkipToolExecution):
            await gate.check("external", SimpleNamespace(tool_kind=None))

    async def test_stdio_not_built_until_plan_approved(self):
        registry = MCPRegistry()
        allowed = False
        registry.allow_stdio = lambda: allowed
        config = Config(mcpServers={"local": Server(command="some-server")})
        built = []
        async def build(selected, stack):
            from pydantic_ai.toolsets import FunctionToolset
            built.append(selected)
            return FunctionToolset()
        with patch.object(registry, "read", return_value=config), patch.object(registry, "build", side_effect=build):
            async with registry.toolsets() as toolsets:
                # Exercise the native dynamic toolset resolver at each phase transition.
                resolver = toolsets[0].toolset_func
                await resolver(None)
                self.assertEqual(built[-1].mcpServers, {})
                allowed = True
                await resolver(None)
                self.assertIn("local", built[-1].mcpServers)
                allowed = False
                await resolver(None)
                self.assertEqual(built[-1].mcpServers, {})
