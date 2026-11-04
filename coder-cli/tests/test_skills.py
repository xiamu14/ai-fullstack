import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import TextPart, ToolCallPart, UserPromptPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel

from agent.runtime import create_agent
from agent.conversation import SkillInvocationError


class SkillsTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.root = Path(self.enterContext(TemporaryDirectory())).resolve()
        self.workspace = self.root / "project"
        self.workspace.mkdir()
        self.home = self.root / "home"
        self.global_skills = self.home / ".agents" / "skills"
        self.observed = []
        self.replies = iter(())

        async def model(messages, info):
            self.observed.append(str(messages))
            part = next(self.replies)
            if isinstance(part, TextPart):
                yield part.content
            else:
                yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

        self.enterContext(patch.dict(os.environ, {
            "MODEL_NAME": "test", "OPENAI_BASE_URL": "https://example.invalid/v1",
            "OPENAI_API_KEY": "test", "CODER_MCP_CONFIG": str(self.root / "mcp.json"),
        }))
        (self.root / "mcp.json").write_text('{"mcpServers": {}}')
        self.enterContext(patch("agent.runtime.load_dotenv"))
        self.enterContext(patch("agent.runtime.Path.home", return_value=self.home))
        self.enterContext(patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(stream_function=model)))
        self.enterContext(patch("agent.runtime.logfire.configure"))
        self.enterContext(patch("agent.runtime.logfire.instrument_pydantic_ai"))
        self.enterContext(patch("storage.sessions.SESSION_DATABASE", self.root / "state/sessions.db"))

    def write_skill(self, name, description, body, frontmatter=""):
        package = self.global_skills / name
        package.mkdir(parents=True, exist_ok=True)
        (package / "SKILL.md").write_text(
            f"---\nname: {name}\ndescription: {description}\n{frontmatter}---\n\n{body}\n", encoding="utf-8",
        )

    async def test_missing_global_library_then_install_and_update_between_runs(self):
        self.replies = iter([
            TextPart("no global skills"),
            ToolCallPart("load_capability", {"id": "global-probe"}), TextPart("loaded"),
            ToolCallPart("load_capability", {"id": "global-probe"}), TextPart("updated"),
        ])
        conversation = await create_agent(path=str(self.workspace))
        await conversation.send("检查可用技能")
        self.assertNotIn("GLOBAL_PROBE_DESCRIPTION", self.observed[-1])
        self.assertIn("mcp-config", self.observed[-1])
        self.assertIn(str(self.root / "mcp.json"), self.observed[-1])

        self.write_skill("global-probe", "GLOBAL_PROBE_DESCRIPTION", "GLOBAL_BODY_V1")
        await conversation.send("加载 global-probe")
        self.assertIn("GLOBAL_PROBE_DESCRIPTION", self.observed[1])
        self.assertNotIn("GLOBAL_BODY_V1", self.observed[1])
        self.assertIn("GLOBAL_BODY_V1", self.observed[2])

        self.write_skill("global-probe", "GLOBAL_PROBE_DESCRIPTION", "GLOBAL_BODY_V2")
        await conversation.send("再次加载 global-probe")
        self.assertIn("GLOBAL_BODY_V2", self.observed[-1])

    async def test_builtin_skill_takes_precedence_over_global_duplicate(self):
        self.write_skill("mcp-config", "GLOBAL_DUPLICATE_DESCRIPTION", "GLOBAL_DUPLICATE_BODY")
        self.replies = iter([
            ToolCallPart("load_capability", {"id": "mcp-config"}), TextPart("loaded builtin"),
        ])
        conversation = await create_agent(path=str(self.workspace))
        with self.assertWarns(UserWarning):
            await conversation.send("加载 mcp-config")
        self.assertNotIn("GLOBAL_DUPLICATE_DESCRIPTION", self.observed[0])
        self.assertNotIn("GLOBAL_DUPLICATE_BODY", self.observed[-1])
        self.assertIn("## 合并与验证", self.observed[-1])

    async def test_explicit_invocation_renders_latest_body_and_persists_it(self):
        self.write_skill("explicit", "Explicit skill", "OLD_BODY", "disable-model-invocation: true\n")
        conversation = await create_agent(path=str(self.workspace))
        catalog = await conversation.skill_catalog()
        skill = next(skill for skill in catalog.skills if skill.name == "explicit")
        self.assertTrue(skill.user_invocable)
        self.assertFalse(skill.model_invocable)
        self.write_skill("explicit", "Explicit skill", "NEW_BODY: $ARGUMENTS", "disable-model-invocation: true\n")
        self.replies = iter([TextPart("done")])
        await conversation.send("target.txt", skill_name="explicit")
        self.assertEqual(len(self.observed), 1)
        self.assertIn("NEW_BODY: target.txt", self.observed[0])
        self.assertNotIn("OLD_BODY", self.observed[0])
        self.assertIn(str(self.global_skills / "explicit"), self.observed[0])
        resumed = await create_agent(conversation.session_id)
        prompts = [part.content for message in resumed.history for part in message.parts if isinstance(part, UserPromptPart)]
        self.assertTrue(any("NEW_BODY: target.txt" in prompt for prompt in prompts))

    async def test_explicit_invocation_checks_permissions_and_missing_skills(self):
        self.write_skill("hidden", "Hidden skill", "hidden body", "user-invocable: false\n")
        self.write_skill("removed", "Removed skill", "removed body")
        conversation = await create_agent(path=str(self.workspace))
        await conversation.skill_catalog()
        (self.global_skills / "removed" / "SKILL.md").unlink()
        for name, error in (("hidden", "不允许主动调用"), ("removed", "技能不可用"), ("unknown", "技能不可用")):
            with self.subTest(name=name), self.assertRaisesRegex(SkillInvocationError, error):
                await conversation.send("task", skill_name=name)
        self.assertFalse(self.observed)
        self.replies = iter([TextPart("builtin")])
        self.write_skill("mcp-config", "Duplicate", "WRONG_BODY")
        with self.assertWarns(UserWarning):
            await conversation.send("configure docs", skill_name="mcp-config")
        self.assertIn("## 合并与验证", self.observed[-1])
        self.assertIn("ARGUMENTS: configure docs", self.observed[-1])
        self.assertNotIn("WRONG_BODY", self.observed[-1])
