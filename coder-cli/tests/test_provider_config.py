import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from agent.runtime import create_agent
from integrations.provider import ModelTier, model_profile, build_model, model_config, load_provider_config


class ProviderConfigTests(unittest.IsolatedAsyncioTestCase):
    def test_model_tiers_validate_names_and_model_references(self):
        data = {"default_model": "probe", "models": {"probe": {"provider": "openai"}}}
        for tiers in ({"unknown": "probe"}, {"high": "missing"}):
            with self.subTest(tiers=tiers), patch(
                "integrations.provider.Path.read_text",
                return_value=json.dumps({**data, "model_tiers": tiers}),
            ):
                with self.assertRaisesRegex(ValueError, "model_tiers"):
                    load_provider_config()

    def test_jsonc_preserves_strings_and_accepts_comments_and_trailing_commas(self):
        source = r'''{
            // Both markers below are part of the model name.
            "default_model": "probe\"///*",
            "models": {
                "probe\"///*": {
                    "provider": "openai",
                    "context_window": 1048576, /* before the closing brace */
                },
            },
        }'''
        with patch("integrations.provider.Path.read_text", return_value=source):
            self.assertEqual(load_provider_config().default_model, 'probe"///*')
            self.assertEqual(model_config().context_window, 1048576)

    def test_configured_and_unknown_models(self):
        self.assertEqual(model_profile(load_provider_config().default_model), model_config().profile)
        self.assertEqual(model_profile("unknown-model"), {})

    def test_invalid_capacity_and_unknown_fields_are_rejected(self):
        for capacity in (0, -1, "1048576", True):
            data = json.dumps({"default_model": "probe", "models": {"probe": {
                "provider": "openai", "context_window": capacity,
            }}})
            with self.subTest(capacity=capacity), patch("integrations.provider.Path.read_text", return_value=data):
                with self.assertRaisesRegex(ValueError, "provider.jsonc 无效"):
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
                "OPENROUTER_BASE_URL": "https://example.invalid/api/v1",
                "OPENROUTER_API_KEY": "test",
            }
            with patch.dict(os.environ, env), patch("agent.runtime.load_dotenv"), \
                 patch("agent.runtime.logfire.configure"), patch("agent.runtime.logfire.instrument_pydantic_ai"), \
                 patch("storage.sessions.SESSION_DATABASE", root / "state/sessions.db"):
                conversation = await create_agent(path=str(root))
            alias = load_provider_config().model_for_tier(ModelTier.MEDIUM)
            self.assertEqual(conversation.agent.model.model_name, model_config(alias).model_name or alias)
            self.assertEqual(conversation.agent.model.context_window, 1048576)
            conversation.history = [ModelResponse(parts=[TextPart("reply")], usage=RequestUsage(input_tokens=524288))]
            self.assertEqual(conversation.context_window_used, 0.5)

    def test_default_model_ignores_environment_model_name(self):
        env = {"OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test", "MODEL_NAME": "wrong-model"}
        with patch.dict(os.environ, env, clear=True), patch("integrations.provider.OpenAIProvider"), \
             patch("pydantic_ai.models.openai.OpenAIChatModel") as factory:
            build_model(openai_model=factory)
        self.assertEqual(factory.call_args.args[0], model_config().model_name or load_provider_config().default_model)
        self.assertEqual(factory.call_args.kwargs["profile"], {"context_window": 1048576})

    def test_model_can_start_without_environment_model_name(self):
        env = {"OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test"}
        with patch.dict(os.environ, env, clear=True), patch("integrations.provider.OpenAIProvider"), \
             patch("pydantic_ai.models.openai.OpenAIChatModel") as factory:
            build_model(openai_model=factory)
        self.assertEqual(factory.call_args.args[0], model_config().model_name or load_provider_config().default_model)

    def test_provider_is_explicit_and_never_guessed_from_model_name(self):
        data = json.dumps({"default_model": "claude-through-gateway", "models": {
            "claude-through-gateway": {"provider": "openai", "timeout": 45},
        }})
        env = {"OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test"}
        with patch("integrations.provider.Path.read_text", return_value=data), \
             patch.dict(os.environ, env, clear=True), patch("integrations.provider.OpenAIProvider"), \
             patch("pydantic_ai.models.openai.OpenAIChatModel") as factory:
            build_model(openai_model=factory)
            self.assertEqual(model_config().timeout, 45)
        self.assertEqual(factory.call_args.args[0], "claude-through-gateway")

    def test_missing_unknown_provider_and_unknown_default_are_rejected(self):
        for model in ({}, {"provider": "claude"}, {"provider": "other"}, {"provider": "openai", "timeout": 0}):
            data = json.dumps({"default_model": "probe", "models": {"probe": model}})
            with self.subTest(model=model), patch("integrations.provider.Path.read_text", return_value=data):
                with self.assertRaisesRegex(ValueError, "provider.jsonc 无效"):
                    load_provider_config()
        data = '{"default_model":"missing","models":{"probe":{"provider":"openai"}}}'
        with patch("integrations.provider.Path.read_text", return_value=data):
            with self.assertRaisesRegex(ValueError, "provider.jsonc 无效"):
                load_provider_config()
        with self.assertRaisesRegex(ValueError, "未定义模型"):
            build_model("missing")

    def test_anthropic_default_does_not_require_openai_credentials(self):
        data = '{"default_model":"claude","models":{"claude":{"provider":"anthropic","context_window":200000}}}'
        with patch("integrations.provider.Path.read_text", return_value=data), \
             patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test", "ANTHROPIC_BASE_URL": "https://anthropic.example.invalid/v1"}, clear=True), \
             patch("pydantic_ai.providers.anthropic.AnthropicProvider") as provider, \
             patch("pydantic_ai.models.anthropic.AnthropicModel") as factory:
            build_model()
        provider.assert_called_once_with(api_key="test", base_url="https://anthropic.example.invalid")
        self.assertEqual(factory.call_args.args[0], "claude")
        self.assertEqual(factory.call_args.kwargs["profile"], {"context_window": 200000})

    def openrouter_config(self, protocol):
        return json.dumps({"default_model": "local-review-model", "models": {
            "local-review-model": {
                "provider": "openrouter", "protocol": protocol, "model_name": "anthropic/claude-sonnet-4.6",
            },
        }})

    def test_openrouter_openai_protocol_uses_native_openrouter_adapter(self):
        with patch("integrations.provider.Path.read_text", return_value=self.openrouter_config("openai")), \
             patch.dict(os.environ, {"OPENROUTER_API_KEY": "router-key", "OPENROUTER_BASE_URL": "https://router.example.invalid/api/v1/"}, clear=True), \
             patch("openai.AsyncOpenAI") as client, \
             patch("pydantic_ai.providers.openrouter.OpenRouterProvider") as provider, \
             patch("pydantic_ai.models.openrouter.OpenRouterModel") as factory:
            build_model()
        client.assert_called_once_with(api_key="router-key", base_url="https://router.example.invalid/api/v1")
        provider.assert_called_once_with(openai_client=client.return_value)
        self.assertEqual(factory.call_args.args[0], "anthropic/claude-sonnet-4.6")
        self.assertIs(factory.call_args.kwargs["provider"], provider.return_value)

    def test_bare_openrouter_model_reports_config_key(self):
        source = self.openrouter_config("openai").replace("anthropic/claude-sonnet-4.6", "gpt-6.1-sol")
        with patch("integrations.provider.Path.read_text", return_value=source):
            with self.assertRaisesRegex(ValueError, r"models\['local-review-model'\]\.model_name"):
                build_model()

    def test_openrouter_anthropic_protocol_uses_router_bearer_token(self):
        env = {"OPENROUTER_API_KEY": "router-key", "OPENROUTER_BASE_URL": "https://router.example.invalid/api/v1/", "ANTHROPIC_API_KEY": "direct-key", "ANTHROPIC_BASE_URL": "https://direct.example.invalid"}
        with patch("integrations.provider.Path.read_text", return_value=self.openrouter_config("anthropic")), \
             patch.dict(os.environ, env, clear=True), \
             patch("anthropic.AsyncAnthropic") as client, \
             patch("pydantic_ai.providers.anthropic.AnthropicProvider") as provider, \
             patch("pydantic_ai.models.anthropic.AnthropicModel") as factory:
            build_model()
        client.assert_called_once_with(auth_token="router-key", base_url="https://router.example.invalid/api")
        provider.assert_called_once_with(anthropic_client=client.return_value)
        self.assertEqual(factory.call_args.args[0], "anthropic/claude-sonnet-4.6")

    def test_invalid_protocol_combinations_and_missing_router_credentials(self):
        for provider, protocol in (("openrouter", None), ("openrouter", "other"), ("openai", "anthropic"), ("anthropic", "openai")):
            data = json.dumps({"default_model": "test", "models": {"test": {
                "provider": provider, "protocol": protocol,
            }}})
            with self.subTest(provider=provider, protocol=protocol), \
                 patch("integrations.provider.Path.read_text", return_value=data):
                with self.assertRaisesRegex(ValueError, "provider.jsonc 无效"):
                    load_provider_config()
        for protocol in ("openai", "anthropic"):
            with self.subTest(protocol=protocol), \
                 patch("integrations.provider.Path.read_text", return_value=self.openrouter_config(protocol)), \
                 patch.dict(os.environ, {"ANTHROPIC_API_KEY": "direct-key"}, clear=True):
                with self.assertRaisesRegex(ValueError, "OPENROUTER_API_KEY"):
                    build_model()

    def test_router_credentials_are_redacted(self):
        from agent.conversation import error_message
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "router-secret"}):
            self.assertNotIn("router-secret", error_message(ValueError("router-secret")))

    def test_every_provider_requires_its_own_address_and_key(self):
        for provider, protocol in (("openai", None), ("anthropic", None), ("openrouter", "openai"), ("openrouter", "anthropic")):
            data = json.dumps({"default_model": "test", "models": {"test": {
                "provider": provider, "protocol": protocol, "model_name": "upstream/test",
            }}})
            prefix = provider.upper()
            for env in ({f"{prefix}_API_KEY": "key"}, {f"{prefix}_BASE_URL": "https://example.invalid/v1"}):
                with self.subTest(provider=provider, protocol=protocol, fields=list(env)), \
                     patch("integrations.provider.Path.read_text", return_value=data), \
                     patch.dict(os.environ, env, clear=True):
                    with self.assertRaisesRegex(ValueError, f"{prefix}_BASE_URL 和 {prefix}_API_KEY"):
                        build_model()
