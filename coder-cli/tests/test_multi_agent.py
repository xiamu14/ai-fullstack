"""Real worktrees, native tasks and simulated models exercise the normal entry points."""
import asyncio
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, ToolCallPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel, DeltaToolCall

from agent.runtime import create_agent
from storage.worktrees import git
from storage.sessions import list_sessions, delete_session
from integrations.provider import build_model


def simulated(function):
    async def stream(messages, info):
        import json
        response = function(messages, info)
        for index, part in enumerate(response.parts):
            if isinstance(part, TextPart):
                yield part.content
            else:
                yield {index: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}
    return FunctionModel(function, stream_function=stream)


class MultiAgentTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        git(self.repo, "init")
        git(self.repo, "config", "user.email", "test@example.invalid")
        git(self.repo, "config", "user.name", "Test")
        (self.repo / "sample.py").write_text("VALUE = 1\n")
        git(self.repo, "add", ".")
        git(self.repo, "commit", "-m", "baseline")
        self.env = patch.dict("os.environ", {
            "MODEL_NAME": "test", "OPENAI_BASE_URL": "https://example.invalid/v1",
            "OPENAI_API_KEY": "test",
        })
        self.env.start()
        self.addCleanup(self.env.stop)

    async def build(self, models, *, workspace=None):
        provider = patch("agent.runtime.build_model", side_effect=models)
        provider.start()
        self.addCleanup(provider.stop)
        with patch("agent.runtime.session_database", return_value=self.root / "state/sessions.db"), \
             patch("agent.runtime.load_dotenv"), patch("agent.runtime.logfire.configure"), \
             patch("agent.runtime.logfire.instrument_pydantic_ai"):
            conversation = await create_agent(path=str(workspace or self.repo))
        self.addAsyncCleanup(conversation.close)
        return conversation

    async def settle(self, conversation):
        async with asyncio.timeout(15):
            while any(record.status == "running" for record in conversation.delegations.owner.records.values()):
                await asyncio.sleep(.01)

    async def test_explicit_reviewer_uses_committed_worktree_and_reports_to_super(self):
        observed = []

        def reviewer(messages, info):
            names = {tool.name for tool in info.function_tools}
            self.assertIn("read_file", names)
            self.assertNotIn("shell", names)
            self.assertNotIn("write_file", names)
            returns = [part for message in messages for part in message.parts if isinstance(part, ToolReturnPart)]
            if not returns:
                return ModelResponse(parts=[ToolCallPart("read_file", {"path": "sample.py"})])
            self.assertIn("VALUE = 1", str(returns[-1].content))
            return ModelResponse(parts=[TextPart("审查完成，无发现。")])

        def super_model(messages, info):
            observed.append(str(messages))
            return ModelResponse(parts=[TextPart("收到 Reviewer 交付，请审核。")])

        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simulated(super_model), simulated(reviewer)])
        await conversation.open(on_task=lambda event: self.observe(observed, event))
        (self.repo / "sample.py").write_text("VALUE = 2\n")
        receipt = await conversation.delegate("/reviewer 审查 sample.py")
        self.assertIn("background", receipt)
        await self.settle(conversation)
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "ok", record.output)
        self.assertEqual((Path(record.working_directory) / "sample.py").read_text(), "VALUE = 1\n")
        self.assertEqual(record.output, "审查完成，无发现。")
        result = await conversation.send("解释审核结果", task_report=(record.id, record.run_id))
        self.assertIn("收到 Reviewer", result.output)
        self.assertTrue(record.delivered)
        self.assertTrue(observed)
        self.assertTrue(any("审查完成" in value for value in observed if isinstance(value, str)))
        self.assertEqual(len(await list_sessions(conversation.delegations.database)), 1)

    @staticmethod
    async def observe(target, event):
        target.append((event.task.id, event.task.status))

    async def test_background_failure_stays_out_of_super_input(self):
        def fail(messages, info):
            raise ValueError("STALE_EXECUTOR_ERROR")

        def super_model(messages, info):
            if "回应失败任务" in str(messages):
                self.assertIn("STALE_EXECUTOR_ERROR", str(messages))
                return ModelResponse(parts=[TextPart("后台任务失败")])
            self.assertNotIn("STALE_EXECUTOR_ERROR", str(messages))
            self.assertIn("原始用户消息", str(messages))
            return ModelResponse(parts=[TextPart("处理当前任务")])

        conversation = await self.build([simulated(super_model), simulated(fail)])
        await conversation.delegate("/reviewer 模拟后台失败")
        await self.settle(conversation)
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "failed")
        self.assertIn("STALE_EXECUTOR_ERROR", record.output)
        self.assertFalse(record.delivered)

        async def saved_history(session_id):
            return [ModelRequest(parts=[UserPromptPart("原始用户消息"), record.report()])]

        conversation.history_loader = saved_history
        result = await conversation.send("一个无关的新任务")
        self.assertEqual(result.output, "处理当前任务")
        self.assertFalse(record.delivered)
        reply = await conversation.send("回应失败任务", task_report=(record.id, record.run_id))
        self.assertEqual(reply.output, "后台任务失败")
        self.assertNotEqual(reply.run_id, result.run_id)
        self.assertTrue(record.delivered)

    async def test_model_delegation_allocates_worktree_and_same_role_clone(self):
        def super_model(messages, info):
            if not any(isinstance(part, ToolReturnPart) for message in messages for part in message.parts):
                return ModelResponse(parts=[ToolCallPart("delegate_task", {
                    "agent_name": "reviewer", "task": "检查 sample.py", "background": False,
                })])
            return ModelResponse(parts=[TextPart("审核完成")])

        calls = 0
        def reviewer(messages, info):
            nonlocal calls
            calls += 1
            if calls == 1:
                return ModelResponse(parts=[ToolCallPart("delegate_task", {
                    "agent_name": "self", "task": "独立检查 sample.py", "background": False,
                })])
            return ModelResponse(parts=[TextPart("证据充分")])

        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simulated(super_model), simulated(reviewer)])
        async with asyncio.timeout(15):
            result = await conversation.send("审核")
        self.assertEqual(result.output, "审核完成")
        records = list(conversation.delegations.owner.records.values())
        self.assertTrue(all(record.outcome == "ok" for record in records), str([(r.outcome, r.output) for r in records]))
        self.assertEqual(len(records), 2)
        self.assertEqual({record.agent_name for record in records}, {"reviewer", "self"})
        self.assertTrue(all(record.outcome == "ok" for record in records), str(records))

    async def test_executor_handoff_requires_actual_user_approval(self):
        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simple] * 4)
        await conversation.delegate("/architect 设计修复")
        await self.settle(conversation)
        source_id = next(iter(conversation.delegations.owner.records))
        async def refuse(text):
            conversation.feedback("拒绝")
        await conversation.open(on_question=refuse)
        receipt = await conversation.delegate("/executor 修复 sample.py", source_id=source_id)
        self.assertIn("未批准", receipt)
        self.assertEqual(list(conversation.delegations.owner.records), [source_id])

    async def test_reviewer_can_run_in_a_non_git_workspace(self):
        directory = self.root / "plain"
        directory.mkdir()
        model = simulated(lambda messages, info: ModelResponse(parts=[TextPart("审核完成")]))
        conversation = await self.build([model, model], workspace=directory)
        await conversation.delegate("/reviewer 审查本地文件")
        await self.settle(conversation)
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "ok", record.output)
        self.assertEqual(Path(record.working_directory), directory.resolve())
        self.assertFalse(conversation.delegations.worktrees.directory.exists())

    async def test_super_delegates_in_subdirectory_under_its_workspace_lease(self):
        directory = self.repo / "module"
        directory.mkdir()

        def super_model(messages, info):
            if any(isinstance(part, ToolReturnPart) for message in messages for part in message.parts):
                return ModelResponse(parts=[TextPart("审核完成")])
            return ModelResponse(parts=[ToolCallPart("delegate_task", {
                "agent_name": "reviewer", "task": "审核本目录", "background": True,
            })])

        reviewer = simulated(lambda messages, info: ModelResponse(parts=[TextPart("证据")]))
        conversation = await self.build([simulated(super_model), reviewer], workspace=directory)
        async with asyncio.timeout(10):
            await conversation.send("审核")
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "ok", record.output)
        self.assertEqual(Path(record.working_directory), directory.resolve())
        self.assertFalse(record.background)

    async def test_direct_executor_writes_ordinary_files_without_approval(self):
        steps = iter([
            ToolCallPart("write_plan", {"items": [{"content": "修改并读取 sample.py", "status": "in_progress"}]}),
            ToolCallPart("write_file", {"path": "sample.py", "content": "VALUE = 3\n"}),
            ToolCallPart("read_file", {"path": "sample.py"}),
            TextPart("已验证 sample.py 为 VALUE = 3"),
        ])
        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        executor = simulated(lambda messages, info: ModelResponse(parts=[next(steps)]))
        conversation = await self.build([simple, executor])
        async def unexpected_question(text):
            self.fail(text)
        await conversation.open(on_question=unexpected_question)
        await conversation.delegate("/executor 修改 sample.py")
        await self.settle(conversation)
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "ok", record.output)
        self.assertEqual((Path(record.working_directory) / "sample.py").read_text(), "VALUE = 3\n")
        self.assertEqual((self.repo / "sample.py").read_text(), "VALUE = 1\n")

    async def test_executor_verifies_with_sandboxed_shell_without_approval(self):
        import sys
        if sys.platform != "darwin":
            self.skipTest("需要 macOS sandbox-exec")
        steps = iter([
            ToolCallPart("shell", {"command": f'"{sys.executable}" -c "assert 1 + 1 == 2; print(42)"'}),
            TextPart("验证完成"),
        ])

        def executor(messages, info):
            returns = [part for message in messages for part in message.parts
                       if isinstance(part, ToolReturnPart) and part.tool_name == "shell"]
            if returns:
                self.assertIn("42", str(returns[-1].content))
                self.assertEqual(returns[-1].outcome, "success")
            return ModelResponse(parts=[next(steps)])

        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simple, simulated(executor)])

        async def unexpected_question(text):
            self.fail(text)

        await conversation.open(on_question=unexpected_question)
        await conversation.delegate("/executor 运行本地断言")
        await self.settle(conversation)
        record = next(iter(conversation.delegations.owner.records.values()))
        self.assertEqual(record.outcome, "ok", record.output)

    async def test_native_records_restore_and_delete_with_super_session(self):
        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("审核结果")]))
        conversation = await self.build([simple, simple])
        await conversation.delegate("/architect 分析设计")
        await self.settle(conversation)
        task = next(iter(conversation.delegations.owner.records.values()))
        original_id, original_run = task.id, task.run_id
        await conversation.close()
        await conversation.open()
        restored = conversation.delegations.owner.records[original_id]
        self.assertEqual(restored.run_id, original_run)
        self.assertEqual(restored.output, "审核结果")
        await conversation.close()
        await delete_session(conversation.delegations.database, conversation.session_id)
        self.assertEqual(await list_sessions(conversation.delegations.database), [])
        self.assertTrue(Path(restored.working_directory).is_dir(), "未整合 worktree 必须保留")

    async def test_readonly_role_cannot_delegate_to_other_role(self):
        attempts = 0
        def reviewer(messages, info):
            nonlocal attempts
            attempts += 1
            if attempts == 1:
                return ModelResponse(parts=[ToolCallPart("delegate_task", {
                    "agent_name": "executor", "task": "写文件", "background": False,
                })])
            return ModelResponse(parts=[TextPart("保持审核角色")])
        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("done")]))
        conversation = await self.build([simple, simulated(reviewer)])
        await conversation.delegate("/reviewer 检查角色边界")
        await self.settle(conversation)
        records = list(conversation.delegations.owner.records.values())
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].output, "保持审核角色")

    async def test_super_waits_for_user_before_executing_reviewed_result(self):
        responses = iter([
            ToolCallPart("write_file", {"path": "sample.py", "content": "VALUE = 99\n"}),
            TextPart("等待授权"),
        ])
        root_model = simulated(lambda messages, info: ModelResponse(parts=[next(responses, TextPart("等待授权"))]))
        reviewer = simulated(lambda messages, info: ModelResponse(parts=[TextPart("第1项需要修复")]))
        conversation = await self.build([root_model, reviewer])
        async def refuse(text):
            conversation.feedback("拒绝")
        await conversation.open(on_question=refuse)
        await conversation.delegate("/reviewer 检查")
        await self.settle(conversation)
        await conversation.send("执行修复", on_question=refuse)
        self.assertEqual((self.repo / "sample.py").read_text(), "VALUE = 1\n")
        self.assertFalse(conversation.delegations.approved_runs)

    async def test_anthropic_binding_uses_native_adapter(self):
        config = '{"default_model":"claude-sonnet-4-6","models":{"claude-sonnet-4-6":{"provider":"anthropic"}}}'
        with patch("integrations.provider.Path.read_text", return_value=config), \
             patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-anthropic", "ANTHROPIC_BASE_URL": "https://api.anthropic.com"}), \
             patch("pydantic_ai.providers.anthropic.AnthropicProvider") as provider, \
             patch("pydantic_ai.models.anthropic.AnthropicModel") as model:
            build_model("claude-sonnet-4-6")
        provider.assert_called_once_with(api_key="test-anthropic", base_url="https://api.anthropic.com")
        self.assertEqual(model.call_args.args[0], "claude-sonnet-4-6")

    async def test_other_provider_credentials_are_lazy(self):
        simple = simulated(lambda messages, info: ModelResponse(parts=[TextPart("Super works")]))
        conversation = await self.build([simple])
        result = await conversation.send("hello")
        self.assertEqual(result.output, "Super works")
