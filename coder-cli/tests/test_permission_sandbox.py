import asyncio
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from agent.interaction import Interaction
from agent.permissions.policy import CURRENT_GRANT, ExecutionPermissions
from agent.permissions.rules import Decision
from agent.permissions.workspace import RestrictedBackend
from integrations.mcp import MCPRegistry


@unittest.skipUnless(sys.platform == "darwin", "本机 macOS sandbox-exec 验证")
class SandboxTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.root = Path(self.enterContext(TemporaryDirectory())).resolve()
        self.project = self.root / "project"
        self.project.mkdir()
        config = self.root / "trust/permissions.json"
        config.parent.mkdir()
        config.write_text('{}')
        self.enterContext(patch.dict("os.environ", {"CODER_PERMISSION_CONFIG": str(config)}))
        self.interaction = Interaction()
        self.policy = ExecutionPermissions(self.project, self.interaction, self.root / "state/sessions.db",
                                           self.root / "mcp.json")
        self.backend = RestrictedBackend(self.project, self.policy)

    async def test_kernel_blocks_outside_write_secret_read_and_policy_mutation(self):
        (self.project / ".env").write_text("DO_NOT_READ")
        outside = self.root / "outside"
        outside.write_text("OUTSIDE_SECRET")
        (self.project / "escape").symlink_to(outside)
        token = CURRENT_GRANT.set(Decision("ask", "approved", "probe", command=True))
        try:
            result = await self.backend.run(["/bin/sh", "-c", "echo allowed > proof.txt"])
            self.assertEqual(result.exit_code, 0, result.stderr)
            for command in ["echo denied > ../outside", "cat .env", "cat escape",
                            f"echo denied > '{self.policy.path}'"]:
                result = await self.backend.run(["/bin/sh", "-c", command])
                self.assertNotEqual(result.exit_code, 0, (command, result))
                self.assertNotIn("DO_NOT_READ", result.stdout)
                self.assertNotIn("OUTSIDE_SECRET", result.stdout)
            self.assertEqual((self.project / "proof.txt").read_text().strip(), "allowed")
            self.assertEqual(outside.read_text(), "OUTSIDE_SECRET")
            self.assertEqual(self.policy.path.read_text(), "{}")
        finally:
            CURRENT_GRANT.reset(token)

    async def test_unapproved_network_fails_and_approved_local_tcp_works(self):
        async def respond(reader, writer):
            writer.write(b"OK")
            await writer.drain()
            writer.close()
        server = await asyncio.start_server(respond, "127.0.0.1", 0)
        port = server.sockets[0].getsockname()[1]
        command = [sys.executable, "-c", f"import socket; print(socket.create_connection(('127.0.0.1',{port}),timeout=1).recv(2))"]
        async with server:
            denied = await self.backend.run(command)
            self.assertNotEqual(denied.exit_code, 0)
            token = CURRENT_GRANT.set(Decision("ask", "approved", "TCP command", command=True))
            try:
                approved = await self.backend.run(command)
                self.assertEqual(approved.exit_code, 0, approved.stderr)
                self.assertIn("OK", approved.stdout)
            finally:
                CURRENT_GRANT.reset(token)

    async def test_file_backend_rejects_symlink_escape(self):
        (self.root / "outside").write_text("secret")
        (self.project / "link").symlink_to(self.root / "outside")
        with self.assertRaises(PermissionError):
            await self.backend.read_bytes(str(self.project / "link"))

    async def test_stdio_rejected_before_process_launch(self):
        marker = self.project / "started"
        path = self.root / "mcp.json"
        path.write_text('{"mcpServers":{"local":{"command":"/bin/sh","args":["-c","touch ' + str(marker) + '"]}}}')
        registry = MCPRegistry(path)
        registry.authorize_stdio = self.policy.authorize_stdio
        with self.assertRaises(PermissionError):
            async with registry.toolsets() as toolsets:
                from pydantic_ai import Agent
                from pydantic_ai.models.test import TestModel
                await Agent(TestModel(), toolsets=toolsets).run("test")
        self.assertFalse(marker.exists())

    async def test_approved_stdio_real_server_starts_and_is_closed(self):
        import os
        from pydantic_ai import Agent
        from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart
        from pydantic_ai.models.function import FunctionModel
        from tests.test_mcp_stdio import SERVER
        (self.project / "server.py").write_text(SERVER)
        path = self.root / "mcp.json"
        import json
        path.write_text(json.dumps({"mcpServers": {"local": {
            "command": sys.executable, "args": ["server.py", "literal"],
            "cwd": str(self.project), "allowed_tools": ["echo"], "defer_loading": False,
        }}}))
        registry = MCPRegistry(path)
        registry.authorize_stdio = self.policy.authorize_stdio
        asked = []
        async def on_question(text):
            asked.append(text)
            self.interaction.feedback("本次允许")
        replies = iter([ToolCallPart("local_echo", {"text": "probe"}), TextPart("done")])
        self.interaction.open(on_question)
        try:
            async with registry.toolsets() as toolsets:
                result = await Agent(FunctionModel(lambda m, i: ModelResponse(parts=[next(replies)])),
                                     toolsets=toolsets).run("echo")
                self.assertEqual(result.output, "done")
        finally:
            self.interaction.close()
        self.assertEqual(len(asked), 1)
        pid = int((self.project / "pid").read_text())
        with self.assertRaises(ProcessLookupError):
            os.kill(pid, 0)
        self.assertIn("ask_start", self.policy.audit_path.read_text())

    async def test_approved_git_updates_metadata_but_plain_shell_cannot(self):
        token = CURRENT_GRANT.set(Decision("ask", "approved", "git init", command=True))
        try:
            initialized = await self.backend.run(["git", "init", "--quiet"])
            self.assertEqual(initialized.exit_code, 0, initialized.stderr)
        finally:
            CURRENT_GRANT.reset(token)
        token = CURRENT_GRANT.set(Decision("ask", "approved", "echo tamper > .git/config", command=True))
        try:
            denied = await self.backend.run(["/bin/sh", "-c", "echo tamper > .git/config"])
            self.assertNotEqual(denied.exit_code, 0)
        finally:
            CURRENT_GRANT.reset(token)

    async def test_custom_protected_globs_apply_to_shell(self):
        self.policy.path.write_text('{"protected_paths":["private/**","secret[12].txt"]}')
        (self.project / "private").mkdir()
        (self.project / "private/token").write_text("PRIVATE")
        (self.project / "secret1.txt").write_text("SECRET")
        token = CURRENT_GRANT.set(Decision("ask", "approved", "read", command=True))
        try:
            for path in ("private/token", "secret1.txt"):
                result = await self.backend.run(["/bin/cat", path])
                self.assertNotEqual(result.exit_code, 0, result.stderr)
                self.assertNotIn("PRIVATE", result.stdout)
                self.assertNotIn("SECRET", result.stdout)
        finally:
            CURRENT_GRANT.reset(token)
