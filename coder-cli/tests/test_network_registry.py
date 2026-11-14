import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import AsyncMock, patch
from types import SimpleNamespace
import os

import httpx2

from integrations.mcp import MCPRegistry, network_fingerprint
from integrations.network import NetworkDenied, NetworkPolicy, PolicyTransport


class RegistryTests(unittest.IsolatedAsyncioTestCase):
    def test_shared_destination_category_rules(self):
        from integrations.network_data import ALLOWED_DATA, check_data
        for destination, categories in ALLOWED_DATA.items():
            for category in categories:
                check_data("public text", destination=destination, category=category)
            for category in ("credentials", "internal", "customer", "personal", "unknown"):
                with self.subTest(destination=destination, category=category), self.assertRaises(NetworkDenied):
                    check_data("otherwise ordinary text", destination=destination, category=category)
        with self.assertRaises(NetworkDenied):
            check_data("public", destination="unregistered-service", category="public")

    async def test_registered_mcp_builtin_paths_skip_classifier(self):
        from pydantic_ai.exceptions import SkipToolExecution
        from pydantic_ai.messages import ToolCallPart
        from pydantic_ai.tools import ToolDefinition
        from agent.interaction import Interaction
        from agent.permissions.policy import ExecutionPermissions

        with TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / "mcp.json"
            path.write_text('{"mcpServers":{"example":{"url":"https://example.com/mcp"}}}')
            config = MCPRegistry(path).read()
            snapshot = network_fingerprint(config.mcpServers["example"], config.network)
            permissions = root / "permissions.json"
            permissions.write_text('{"rules":[{"tool":"example_echo","action":"allow"}]}')
            metadata = {"ani_mcp": True, "ani_mcp_service": "example", "ani_mcp_policy": snapshot}
            definition = ToolDefinition(name="example_echo", metadata=metadata)
            ctx = SimpleNamespace(run_id="run", conversation_id="conversation", tool_call_approved=False)
            with patch.dict(os.environ, {"CODER_PERMISSION_CONFIG": str(permissions)}):
                policy = ExecutionPermissions(root, Interaction(), root / "state/db", path)
                unregistered = ToolDefinition(name="unregistered")
                with self.assertRaises(SkipToolExecution):
                    await policy.before_tool_execute(ctx, call=ToolCallPart("unregistered", {}),
                                                     tool_def=unregistered, args={})
                with patch("agent.permissions.policy.check_public_text", new_callable=AsyncMock) as classify:
                    call = ToolCallPart("example_echo", {"text": "public text"})
                    self.assertEqual(await policy.before_tool_execute(ctx, call=call, tool_def=definition,
                                                                     args=call.args_as_dict()), {"text": "public text"})
                    private = ToolCallPart("example_echo", {"text": "password=hidden"})
                    with self.assertRaises(SkipToolExecution):
                        await policy.before_tool_execute(ctx, call=private, tool_def=definition,
                                                         args=private.args_as_dict())
                    classify.assert_not_awaited()

    async def test_revoked_mcp_service_cannot_send_using_old_connection(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "mcp.json"
            data = {"mcpServers": {"example": {"url": "https://example.com/mcp"}},
                    "network": {"allowed_origins": ["https://example.com"]}}
            path.write_text(json.dumps(data))
            registry = MCPRegistry(path)
            config = registry.read()
            fingerprint = network_fingerprint(config.mcpServers["example"], config.network)
            registry.check_service("example", fingerprint)
            transport = PolicyTransport(NetworkPolicy(["https://example.com"], []), 0,
                                        "https://example.com", before_send=lambda: registry.check_service("example", fingerprint))

            async def resolve(url):
                data["mcpServers"]["example"]["enabled"] = False
                path.write_text(json.dumps(data))
                return "93.184.216.34"

            with patch.object(transport.policy, "resolve", side_effect=resolve), patch.object(
                transport.transport, "handle_async_request", new_callable=AsyncMock,
            ) as send:
                with self.assertRaises(NetworkDenied):
                    await transport.handle_async_request(httpx2.Request("POST", "https://example.com/mcp", content=b"{}"))
                send.assert_not_awaited()
            await transport.aclose()

    def test_missing_or_changed_server_policy_is_denied(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "mcp.json"
            path.write_text('{"mcpServers":{"example":{"url":"https://example.com/mcp"}}}')
            registry = MCPRegistry(path)
            config = registry.read()
            fingerprint = network_fingerprint(config.mcpServers["example"], config.network)
            for name, expected in (("unknown", fingerprint), ("example", "old-policy")):
                with self.subTest(name=name), self.assertRaises(NetworkDenied):
                    registry.check_service(name, expected)
