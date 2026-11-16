"""Focused ownership, cancellation and writable-clone regression checks."""
import asyncio
from pathlib import Path
import unittest

from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart

from tests import test_multi_agent as fixtures
from agent.permissions.workspace import RestrictedBackend
from storage.execution_lock import ExecutionBusyError, delegation_lease
from storage.sessions import delete_session


class MultiRuntimeTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = fixtures.MultiAgentTests.asyncSetUp
    build = fixtures.MultiAgentTests.build
    settle = fixtures.MultiAgentTests.settle

    async def test_executor_clone_keeps_permissions_and_own_plan_without_deadlock(self):
        steps = iter([
            ToolCallPart("delegate_task", {"agent_name": "self", "task": "修改 sample.py", "background": False}),
            ToolCallPart("write_plan", {"items": [{"content": "修改 sample.py 并验证", "status": "in_progress"}]}),
            ToolCallPart("write_file", {"path": "sample.py", "content": "VALUE = 7\n"}),
            ToolCallPart("read_file", {"path": "sample.py"}),
            TextPart("分身验证完成"),
            TextPart("Executor 汇总完成"),
        ])
        simple = fixtures.simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        executor = fixtures.simulated(lambda messages, info: ModelResponse(parts=[next(steps)]))
        conversation = await self.build([simple, executor])
        async def approve(text):
            conversation.feedback("本次允许")
        await conversation.open(on_question=approve)
        await conversation.delegate("/executor 完成修改")
        await self.settle(conversation)
        records = list(conversation.delegations.owner.records.values())
        self.assertEqual(len(records), 2)
        self.assertTrue(all(record.outcome == "ok" for record in records), str([(r.outcome, r.output) for r in records]))
        self.assertEqual((Path(records[0].working_directory) / "sample.py").read_text(), "VALUE = 7\n")
        self.assertEqual((self.repo / "sample.py").read_text(), "VALUE = 1\n")

    async def test_readonly_backend_rejects_writes_and_commands(self):
        simple = fixtures.simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simple, simple])
        await conversation.delegate("/reviewer 检查")
        await self.settle(conversation)
        backend = next(item for item in conversation.delegations.backends
                       if isinstance(item, RestrictedBackend) and item.policy.role_read_only)
        with self.assertRaises(PermissionError):
            await backend.write_bytes(str(backend.root / "sample.py"), b"bad")
        with self.assertRaises(PermissionError):
            await backend.run(["touch", "bad"])

    async def test_close_cancels_child_and_resume_uses_native_history(self):
        entered, release = asyncio.Event(), asyncio.Event()
        task_id = None
        async def reviewer_stream(messages, info):
            entered.set()
            await release.wait()
            yield "恢复审核完成"
        def root(messages, info):
            if any(isinstance(part, ToolReturnPart) and part.tool_name == "delegate_task"
                   for message in messages for part in message.parts):
                return ModelResponse(parts=[TextPart("已恢复")])
            return ModelResponse(parts=[ToolCallPart("delegate_task", {
                "agent_name": "reviewer", "task": "继续检查已有副作用", "resume": task_id,
                "background": False,
            })])
        conversation = await self.build([
            fixtures.simulated(root), fixtures.FunctionModel(stream_function=reviewer_stream),
        ])
        await conversation.delegate("/reviewer 长任务")
        await asyncio.wait_for(entered.wait(), 5)
        task_id = next(iter(conversation.delegations.owner.records))
        first_run = conversation.delegations.owner.records[task_id].run_id
        await conversation.close()
        await conversation.open()
        self.assertEqual(conversation.delegations.owner.records[task_id].outcome, "cancelled")
        release.set()
        async with asyncio.timeout(15):
            await conversation.send("检查后继续审核")
        record = conversation.delegations.owner.records[task_id]
        self.assertEqual(record.outcome, "ok", record.output)
        self.assertNotEqual(record.run_id, first_run)
        self.assertEqual(record.output, "恢复审核完成")

    async def test_live_shell_lease_prevents_second_shell_and_deletion(self):
        simple = fixtures.simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simple])
        async def observe(event):
            pass
        await conversation.open(on_task=observe)
        with self.assertRaises(ExecutionBusyError):
            with delegation_lease(conversation.delegations.database, conversation.session_id):
                pass
        with self.assertRaises(ExecutionBusyError):
            await delete_session(conversation.delegations.database, conversation.session_id)

    async def test_super_clone_reuses_root_and_cannot_route_to_other_roles(self):
        calls = 0
        def model(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                return ModelResponse(parts=[ToolCallPart("delegate_task", {
                    "agent_name": "self", "task": "调查 sample.py", "background": False,
                })])
            if calls == 2:
                tool = next(tool for tool in info.function_tools if tool.name == "delegate_task")
                self.assertEqual(tool.parameters_json_schema["properties"]["agent_name"]["enum"], ["self"])
                return ModelResponse(parts=[ToolCallPart("delegate_task", {
                    "agent_name": "executor", "task": "不应启动", "background": False,
                })])
            return ModelResponse(parts=[TextPart("调查完成")])
        conversation = await self.build([fixtures.simulated(model)])
        async with asyncio.timeout(15):
            result = await conversation.send("调查")
        self.assertEqual(result.output, "调查完成")
        records = list(conversation.delegations.owner.records.values())
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].agent_name, "self")
        self.assertEqual(records[0].outcome, "ok", records[0].output)
