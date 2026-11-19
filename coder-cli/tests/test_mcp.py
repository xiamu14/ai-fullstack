import asyncio
import json
from pathlib import Path
import socket
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai import Agent
from pydantic_ai.messages import ToolReturnPart
import httpx2
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from agent.conversation import Conversation
from integrations.mcp import MCPConfigError, MCPRegistry
from integrations.network import NetworkDenied


class MCPTests(unittest.IsolatedAsyncioTestCase):
    async def test_invalid_config_is_explicit_and_redacts_headers(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "mcp.json"
            registry = MCPRegistry(path)
            path.write_text('{"mcpServers":{"test":{"url":"https://mcp.example","headers":"secret-token"}}}')
            with self.assertRaises(MCPConfigError) as error:
                registry.read()
            self.assertNotIn("secret-token", str(error.exception))
            path.write_text('{"mcpServers":{"test":{"url":"https://mcp.example","command":"sh"}}}')
            with self.assertRaises(MCPConfigError):
                registry.read()
            path.write_text('{"mcpServers":{"test":{"url":"https://mcp.example"}}}')
            with self.assertRaises(NetworkDenied):
                await Conversation(Agent("test"), mcp=registry).send("must reject before connecting")

    async def test_real_mcp_same_run_registration_discovery_filter_call_and_removal(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            with socket.socket() as sock:
                sock.bind(("127.0.0.1", 0))
                port = sock.getsockname()[1]
            script = root / "server.py"
            script.write_text('''from mcp.server import MCPServer
mcp = MCPServer("test", instructions="DO_NOT_INJECT_SERVER_INSTRUCTIONS")
@mcp.tool()
def echo(text: str) -> str:
    """Echo text for the user."""
    return "ECHO:" + text
@mcp.tool()
def hidden() -> str:
    """A tool excluded by policy."""
    return "hidden"
@mcp.tool()
async def slow() -> str:
    """Wait to verify the client deadline."""
    import asyncio
    await asyncio.sleep(1)
    return "late"
if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="127.0.0.1", port=''' + str(port) + ')\n')
            process = subprocess.Popen([sys.executable, str(script)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for _ in range(100):
                    try:
                        _, writer = await asyncio.open_connection("127.0.0.1", port)
                        writer.close()
                        await writer.wait_closed()
                        break
                    except OSError:
                        if process.poll() is not None:
                            self.fail("test MCP server exited")
                        await asyncio.sleep(.02)
                else:
                    self.fail("test MCP server timed out")
                config_path = root / "mcp.json"
                config_path.write_text('{}')
                seen = []
                phase = "empty"
                def respond(request):
                    payload = json.loads(request.content)
                    names = {tool["function"]["name"] for tool in payload.get("tools", [])}
                    seen.append(names)
                    self.assertNotIn("demo_hidden", names)
                    self.assertNotIn("DO_NOT_INJECT_SERVER_INSTRUCTIONS", repr(payload))
                    call = None
                    if phase == "empty":
                        self.assertNotIn("demo_echo", names)
                    elif phase in {"register", "remove"}:
                        call = ("checkpoint", {})
                    elif phase == "timeout":
                        call = ("demo_slow", {})
                    elif "demo_echo" not in names:
                        call = ("search_tools", {"queries": ["echo"]})
                    elif not any(m.get("role") == "tool" and "ECHO:hello" in str(m) for m in payload["messages"]):
                        call = ("demo_echo", {"text": "hello"})
                    message = {"role": "assistant", "content": "Done"}
                    if call:
                        message = {"role": "assistant", "content": None, "tool_calls": [{
                            "id": "call-" + str(len(seen)), "type": "function", "function": {
                                "name": call[0], "arguments": json.dumps(call[1]),
                            },
                        }]}
                    return httpx2.Response(200, json={
                        "id": "test", "object": "chat.completion", "created": 0, "model": "test",
                        "choices": [{"index": 0, "message": message, "finish_reason": "tool_calls" if call else "stop"}],
                    })
                client = httpx2.AsyncClient(transport=httpx2.MockTransport(respond))
                self.addAsyncCleanup(client.aclose)
                model = OpenAIChatModel("test", provider=OpenAIProvider(
                    base_url="https://example.invalid/v1", api_key="test", http_client=client,
                ))
                endpoint = f"http://127.0.0.1:{port}"
                def checkpoint() -> str:
                    """Pause while an external configuration update arrives."""
                    nonlocal phase
                    if phase == "remove":
                        config_path.write_text('{}')
                        phase = "empty"
                        return "Configuration removed"
                    config_path.write_text(json.dumps({
                        "mcpServers": {"demo": {"url": endpoint + "/mcp", "allowed_tools": ["echo"]}},
                        "network": {"allowed_origins": [endpoint], "allow_private_origins": [endpoint]},
                    }))
                    phase = "registered"
                    return "Configuration updated"
                conversation = Conversation(Agent(model, tools=[checkpoint]), mcp=MCPRegistry(config_path))
                await conversation.send("First")
                phase = "register"
                with patch.object(conversation.mcp, "build", wraps=conversation.mcp.build) as build:
                    await conversation.send("Echo hello")
                    self.assertEqual(build.call_count, 2)  # Empty catalog, then the registered server.
                self.assertNotIn("search_tools", seen[1])
                self.assertIn("search_tools", seen[2], repr(seen))
                self.assertNotIn("demo_echo", seen[2])
                self.assertIn("demo_echo", seen[-1])
                self.assertTrue(any(isinstance(p, ToolReturnPart) and p.content == "ECHO:hello"
                                    for m in conversation.history for p in m.parts))
                phase = "remove"
                await conversation.send("Removed")
                self.assertNotIn("demo_echo", seen[-1])
                config_path.write_text(json.dumps({
                    "mcpServers": {"demo": {"url": endpoint + "/mcp", "allowed_tools": ["slow"], "defer_loading": False}},
                    "network": {"allowed_origins": [endpoint], "allow_private_origins": [endpoint], "call_timeout": .01},
                }))
                phase = "timeout"
                previous = conversation.history
                with self.assertRaises(TimeoutError):
                    await conversation.send("Slow")
                self.assertIs(conversation.history, previous)
            finally:
                process.terminate()
                process.wait(timeout=5)
