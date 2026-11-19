from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from pydantic_ai import Agent
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import FunctionModel

from agent.conversation import Conversation
from agent.interaction import Interaction
from tools.external_hooks import PREVIEW, HookSettings, ResultHook, external_result_hooks, load_hook_settings


class ExternalHookTests(unittest.IsolatedAsyncioTestCase):
    async def test_range_approval_can_persist_for_matching_hook_only(self):
        noise = "debug: " + "x" * 100 + "\n"
        raw = noise + ("k" * (PREVIEW - len(noise) - 1)) + "\n" + noise
        raw += "ERROR: failed\n[exit code: 1]\nOutput: /tmp/shell.log"
        root = Path(self.enterContext(TemporaryDirectory()))
        database = root / "sessions.db"
        for choice, approved, prompt, workspace, extra in (
            ("拒绝", False, True, root, 256),
            ("本次允许", True, True, root, 256),
            ("同意", False, True, root, 256),
            ("以后都允许", True, True, root, 256),
            ("", True, False, root, 256),
            ("拒绝", False, True, root, 512),
            ("拒绝", False, True, root / "other", 256),
        ):
            with self.subTest(choice=choice):
                settings = HookSettings(hooks=[ResultHook(tool="shell", remove_prefix="debug:", extra_chars=extra)])
                interaction = Interaction()
                questions = []

                def shell():
                    return raw

                responses = iter([ToolCallPart("shell", {}), TextPart("done")])
                agent = Agent(
                    FunctionModel(lambda m, i: ModelResponse(parts=[next(responses)])),
                    tools=[shell], capabilities=[external_result_hooks(
                        settings, interaction, database=database, workspace=workspace, config_path=root / "hooks.json",
                    )],
                )
                conversation = Conversation(agent, interaction=interaction)

                async def answer(question):
                    questions.append(question)
                    self.assertTrue(conversation.feedback(choice))

                result = await conversation.send("inspect", on_question=answer)
                output = next(p.content for m in result.all_messages() for p in m.parts
                              if isinstance(p, ToolReturnPart))
                self.assertEqual(output.count(noise), 0 if approved else 1)
                self.assertIn("ERROR: failed\n[exit code: 1]\nOutput: /tmp/shell.log", output)
                self.assertEqual(len(questions), int(prompt))
                if prompt:
                    self.assertIn("Hook 审批", questions[0])
                    self.assertIn(f"每次最多额外 {extra} 字符", questions[0])
                    self.assertIn("1. 本次允许\n2. 拒绝\n3. 以后都允许", questions[0])
                    self.assertNotIn("本会话允许", questions[0])

    def test_script_file_and_network_operations_are_rejected_on_load(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "hooks.json"
            for field in ("command", "read_file", "url"):
                with self.subTest(field=field):
                    path.write_text('{"hooks":[{"tool":"shell","remove_prefix":"debug:","' + field + '":"value"}]}')
                    with self.assertRaisesRegex(ValueError, "拒绝加载 Hook"):
                        load_hook_settings(path)
