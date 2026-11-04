import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import TextPart, ToolCallPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel

from agent.runtime import create_agent


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

    def write_skill(self, name, description, body):
        package = self.global_skills / name
        package.mkdir(parents=True, exist_ok=True)
        (package / "SKILL.md").write_text(
            f"---\nname: {name}\ndescription: {description}\n---\n\n{body}\n", encoding="utf-8",
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
        self.assertIn("web-download", self.observed[-1])
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
