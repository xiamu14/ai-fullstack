import os
import base64
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import AsyncMock, patch

import httpx
import httpx2

from integrations.model_http import ModelTransport
from integrations.network import NetworkDenied
from integrations.network_privacy import check_content
from integrations.shell_http import prepare_curl
from integrations.shell_network import unsupported_network
from integrations.web_http import fetch_http


class RequestTests(unittest.IsolatedAsyncioTestCase):
    def test_file_and_form_payloads_are_frozen(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "report.txt"
            source.write_text("public report")
            request = prepare_curl(["https://example.com", "--json", "@report.txt"], root)
            source.write_text("password=changed")
            self.assertEqual(request.body, b"public report")
            self.assertEqual(request.headers["content-type"], "application/json")
            with self.assertRaises(NetworkDenied):
                prepare_curl(["https://example.com", "-T", "report.txt"], root)
            source.write_text("public report")
            request = prepare_curl(["https://example.com", "-F", "file=@report.txt", "-F", "title=example"], root)
            self.assertIn(b'filename="report.txt"', request.body)
            self.assertIn(b"public report", request.body)
            self.assertIn(b'name="title"', request.body)
            self.assertIn("multipart/form-data", request.headers["content-type"])

    def test_upload_scope_and_formats(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "public.txt").write_text("hello")
            (root / "alias").symlink_to(root / "public.txt")
            (root / ".env").write_text("not a token")
            for args in (["-T", "../outside"], ["-T", "/etc/passwd"], ["-T", "-"],
                         ["-T", "alias"], ["-T", ".env"], ["-H", "Authorization: Bearer hidden"],
                         ["-H", "Host: elsewhere.example"], ["-H", "X-Thing: password=hidden"],
                         ["-H", "X-Thing: hello\r\nInjected: yes"]):
                with self.subTest(args=args), self.assertRaises((NetworkDenied, OSError)):
                    prepare_curl(["https://example.com", *args], root, protected=(".env*",))
            request = prepare_curl(["https://example.com", "-T", "public.txt"], root)
            self.assertEqual((request.method, request.body), ("PUT", b"hello"))

    def test_encoded_secret_and_cache_credential_changes(self):
        with self.assertRaises(NetworkDenied):
            check_content(r'{"pass\u0077ord":"private"}')
        with self.assertRaises(NetworkDenied):
            check_content(base64.b64encode(b"password=private-value"))
        check_content("ordinary-value-12345")
        with patch.dict(os.environ, {"NEW_API_KEY": "ordinary-value-12345"}):
            with self.assertRaises(NetworkDenied):
                check_content("ordinary-value-12345")
        with self.assertRaises(NetworkDenied):
            prepare_curl(["https://example.com", "-G", "--data-urlencode", "password=hidden"])

    def test_model_source_projection_preserves_local_history(self):
        from integrations.model_data import model_messages
        from pydantic_ai.messages import ModelResponse, ModelRequest, ToolCallPart, ToolReturnPart
        messages = [ModelResponse(parts=[ToolCallPart("read_file", {"path": ".env"}, "private")]),
                    ModelRequest(parts=[ToolReturnPart("read_file", "sensitive arbitrary text", "private")])]
        projected, restricted = model_messages(messages, Path.cwd(), (".env*",))
        self.assertEqual(restricted, {"private"})
        self.assertNotIn("sensitive arbitrary text", projected[1].parts[0].content)
        self.assertEqual(messages[1].parts[0].content, "sensitive arbitrary text")

    def test_network_catalog_denies_uncontrolled_commands(self):
        for command in ("wget https://example.com", "git fetch origin", "npm publish", "ssh host command",
                        "dig example.com", "nc example.com 80", "gh issue create", "open https://example.com",
                        "echo first; curl https://example.com", "python script.py; scp file host:path"):
            with self.subTest(command=command):
                self.assertIsNotNone(unsupported_network(command))
        for command in ("git status", "git push origin main", "curl https://example.com", "rsync a b",
                        "cargo test --offline"):
            self.assertIsNone(unsupported_network(command), command)

    async def test_sdk_serialized_secret_never_reaches_transport(self):
        transport = ModelTransport("https://example.com/v1")
        send = AsyncMock()
        with patch.object(transport.transport.transport, "handle_async_request", send):
            with self.assertRaises(NetworkDenied):
                await transport.handle_async_request(httpx.Request(
                    "POST", "https://example.com/v1/chat/completions", content=b'{"password":"hidden"}',
                ))
        send.assert_not_awaited()
        await transport.aclose()

    async def test_sdk_streaming_and_destination_binding(self):
        transport = ModelTransport("https://example.com/v1")
        requests = []

        async def receive(request):
            requests.append(request)
            return httpx2.Response(200, stream=httpx2.ByteStream(b'data: hello\n\n'))

        with patch.object(transport.transport.policy, "resolve", AsyncMock(return_value="93.184.216.34")), \
             patch.object(transport.transport.transport, "handle_async_request", side_effect=receive):
            async with httpx.AsyncClient(transport=transport) as client:
                response = await client.post("https://example.com/v1/chat/completions", json={"messages": ["hello"]})
                self.assertEqual(response.text, "data: hello\n\n")
                with self.assertRaises(NetworkDenied):
                    await client.post("https://other.example/v1", content=b"public")
        self.assertEqual(len(requests), 1)
        self.assertEqual(requests[0].url.host, "93.184.216.34")
        self.assertEqual(requests[0].headers["Host"], "example.com")
        self.assertEqual(requests[0].extensions["sni_hostname"], "example.com")

    async def test_http_sensitive_header_never_creates_client(self):
        with patch("integrations.web_http.httpx2.AsyncClient") as client:
            with self.assertRaises(NetworkDenied):
                await fetch_http("https://example.com", headers={"X-Data": "password=private"})
            client.assert_not_called()

    async def test_gateway_cookie_is_not_replayed_on_next_model_request(self):
        transport = ModelTransport("https://example.com/v1")
        send = AsyncMock(side_effect=lambda request: httpx2.Response(
            200, headers={"Set-Cookie": "gateway_session=opaque; Path=/"},
            stream=httpx2.ByteStream(b"ok"),
        ))
        url = "https://example.com/v1/chat/completions"
        with patch.object(transport.transport.policy, "resolve", AsyncMock(return_value="93.184.216.34")), \
             patch.object(transport.transport.transport, "handle_async_request", send):
            async with httpx.AsyncClient(transport=transport, trust_env=False) as client:
                for _ in range(2):
                    self.assertEqual((await client.post(url, json={"messages": []})).text, "ok")
                for name in ("Cookie", "Proxy-Authorization"):
                    with self.assertRaisesRegex(NetworkDenied, name.lower()):
                        await client.post(url, json={"messages": []}, headers={name: "opaque"})
        self.assertEqual(send.await_count, 2)
        self.assertTrue(all("cookie" not in call.args[0].headers for call in send.await_args_list))

    async def test_approved_http_payload_change_is_not_sent(self):
        from pydantic_ai import Agent
        from pydantic_ai.capabilities import HandleDeferredToolCalls
        from pydantic_ai.messages import ModelResponse, ToolCallPart, TextPart
        from pydantic_ai.models.function import FunctionModel
        from pydantic_ai_harness.coder import Coder
        from agent.permissions.policy import ExecutionPermissions
        from agent.permissions.workspace import RestrictedWorkspace
        from agent.interaction import Interaction

        with TemporaryDirectory() as directory:
            root = Path(directory)
            project = root / "project"
            project.mkdir()
            source = project / "report.txt"
            source.write_text("first public payload")
            config = root / "permissions.json"
            config.write_text("{}")
            interaction = Interaction()

            async def approve(*args, **kwargs):
                source.write_text("changed public payload")
                return True, False

            interaction.approve = AsyncMock(side_effect=approve)
            with patch.dict(os.environ, {"CODER_PERMISSION_CONFIG": str(config)}):
                policy = ExecutionPermissions(project, interaction, root / "state/db", root / "mcp.json",
                                              policy_id="coding")
                parts = iter([ToolCallPart("shell", {"command":
                    "curl -X DELETE https://example.com --data-binary @report.txt"}), TextPart("done")])
                agent = Agent(FunctionModel(lambda m, i: ModelResponse(parts=[next(parts)])), capabilities=[
                    Coder(repo_context=False, sub_agents=False), policy, RestrictedWorkspace(project, policy),
                    HandleDeferredToolCalls(handler=policy.handle),
                ])
                with patch("agent.permissions.policy.fetch_http", new_callable=AsyncMock) as send:
                    result = await agent.run("delete")
                interaction.approve.assert_awaited_once()
                send.assert_not_awaited()
                self.assertIn("批准已失效", str(result.all_messages()))

    async def test_model_hook_projects_history_before_remote_model(self):
        from pydantic_ai import Agent
        from pydantic_ai.messages import ModelResponse, ModelRequest, ToolCallPart, ToolReturnPart, TextPart
        from pydantic_ai.models.function import FunctionModel
        from agent.permissions.policy import ExecutionPermissions
        from agent.interaction import Interaction

        class RemoteModel(FunctionModel):
            @property
            def base_url(self):
                return "https://example.com/v1"

        def model(messages, info):
            self.assertNotIn("private-source-canary", str(messages))
            return ModelResponse(parts=[TextPart("done")])

        history = [ModelResponse(parts=[ToolCallPart("read_file", {"path": ".env"}, "private")]),
                   ModelRequest(parts=[ToolReturnPart("read_file", "private-source-canary", "private")])]
        with TemporaryDirectory() as directory:
            root = Path(directory)
            config = root / "permissions.json"
            config.write_text("{}")
            with patch.dict(os.environ, {"CODER_PERMISSION_CONFIG": str(config)}):
                policy = ExecutionPermissions(root, Interaction(), root / "state/db", root / "mcp.json")
                agent = Agent(RemoteModel(model), capabilities=[policy])
                self.assertEqual((await agent.run("continue", message_history=history)).output, "done")
        self.assertIn("private-source-canary", str(history))
