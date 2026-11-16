"""Plans track progress independently of execution permissions."""
from contextlib import chdir
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness.planning import SqlitePlanStore

from agent.runtime import create_agent
from tests.test_resume import runtime_model


class PlanningTests(unittest.IsolatedAsyncioTestCase):
    async def test_super_writes_files_with_or_without_a_plan(self):
        for use_plan in (False, True):
            with self.subTest(use_plan=use_plan), TemporaryDirectory() as directory, chdir(directory):
                parts = []
                if use_plan:
                    parts.append(ToolCallPart("write_plan", {
                        "items": [{"content": "创建 probe.txt", "status": "in_progress"}],
                    }))
                parts.extend([
                    ToolCallPart("write_file", {"path": "probe.txt", "content": "ok"}),
                    TextPart("完成"),
                ])
                replies = iter(parts)
                model = FunctionModel(lambda messages, info: ModelResponse(parts=[next(replies)]))
                async def unexpected_question(question):
                    self.fail(question)
                with runtime_model(model):
                    conversation = await create_agent()
                    self.addAsyncCleanup(conversation.close)
                    await conversation.send("创建文件", on_question=unexpected_question)
                self.assertEqual(Path("probe.txt").read_text(), "ok")
                store = SqlitePlanStore(str(conversation.delegations.database), session=conversation.session_id)
                self.assertEqual(bool(await store.get_items()), use_plan)

    async def test_explicit_shell_ask_rule_still_applies_without_a_plan(self):
        with TemporaryDirectory() as directory, chdir(directory):
            config = Path(directory) / "permissions.json"
            config.write_text('{"rules":[{"tool":"shell","action":"ask"}]}')
            replies = iter([ToolCallPart("shell", {"command": "touch shell-probe"}), TextPart("完成")])
            questions = []

            async def refuse(question):
                questions.append(question)
                conversation.feedback("拒绝")

            with patch.dict("os.environ", {"CODER_PERMISSION_CONFIG": str(config)}), \
                 runtime_model(FunctionModel(lambda messages, info: ModelResponse(parts=[next(replies)]))):
                conversation = await create_agent()
                self.addAsyncCleanup(conversation.close)
                await conversation.send("执行命令", on_question=refuse)
            self.assertEqual(len(questions), 1)
            self.assertIn("工具审批", questions[0])
            self.assertFalse(Path("shell-probe").exists())

    @unittest.skipUnless(sys.platform == "darwin", "需要 macOS sandbox-exec")
    async def test_super_defaults_to_sandboxed_shell_without_approval(self):
        async def unexpected_question(question):
            self.fail(question)

        with TemporaryDirectory() as directory, chdir(directory):
            replies = iter([ToolCallPart("shell", {"command": "echo verified"}), TextPart("完成")])
            with runtime_model(FunctionModel(lambda messages, info: ModelResponse(parts=[next(replies)]))):
                conversation = await create_agent()
                self.addAsyncCleanup(conversation.close)
                result = await conversation.send("执行本地验证", on_question=unexpected_question)
            returns = [part for message in result.new_messages() for part in message.parts
                       if isinstance(part, ToolReturnPart) and part.tool_name == "shell"]
            self.assertEqual(len(returns), 1)
            self.assertEqual(returns[0].outcome, "success")
            self.assertIn("verified", str(returns[0].content))
