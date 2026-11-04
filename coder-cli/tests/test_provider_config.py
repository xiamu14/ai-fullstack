import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from agent.runtime import create_agent
from integrations.provider import model_profile


class ProviderConfigTests(unittest.IsolatedAsyncioTestCase):
    def test_configured_and_unknown_models(self):
        self.assertEqual(model_profile("GLM-5.3-Flash-Event"), {"context_window": 1048576})
        self.assertEqual(model_profile("unknown-model"), {})

    def test_invalid_capacity_and_unknown_fields_are_rejected(self):
        for capacity in (0, -1, "1048576", True):
            data = json.dumps({"models": {"probe": {"context_window": capacity}}})
            with self.subTest(capacity=capacity), patch("integrations.provider.Path.read_text", return_value=data):
                with self.assertRaisesRegex(ValueError, "provider.json 无效"):
                    model_profile("probe")
        with patch("integrations.provider.Path.read_text", return_value='{"unexpected": 1}'):
            with self.assertRaises(ValueError):
                model_profile("probe")

    async def test_factory_uses_configured_capacity_for_context_percentage(self):
        from pydantic_ai.messages import ModelResponse, TextPart
        from pydantic_ai.usage import RequestUsage

        with TemporaryDirectory() as directory:
            root = Path(directory)
            env = {
                "MODEL_NAME": "GLM-5.3-Flash-Event", "OPENAI_BASE_URL": "https://example.invalid/v1",
                "OPENAI_API_KEY": "test",
            }
            with patch.dict(os.environ, env), patch("agent.runtime.load_dotenv"), \
                 patch("agent.runtime.logfire.configure"), patch("agent.runtime.logfire.instrument_pydantic_ai"), \
                 patch("storage.sessions.SESSION_DATABASE", root / "state/sessions.db"):
                conversation = await create_agent(path=str(root))
            self.assertEqual(conversation.agent.model.context_window, 1048576)
            conversation.history = [ModelResponse(parts=[TextPart("reply")], usage=RequestUsage(input_tokens=524288))]
            self.assertEqual(conversation.context_window_used, 0.5)
