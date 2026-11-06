import asyncio
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from pydantic_ai import Agent
from pydantic_ai.capabilities import HandleDeferredToolCalls, LocalWorkspace
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import FunctionModel
from pydantic_ai_harness.coder import Coder

from agent.conversation import Conversation
from agent.interaction import Interaction
from agent.permissions.config import load_settings
from agent.permissions.policy import ExecutionPermissions
from agent.permissions.workspace import RestrictedWorkspace


class PermissionTests(unittest.IsolatedAsyncioTestCase):
    def test_executor_default_shell_grant_respects_explicit_policy(self):
        tool = SimpleNamespace(tool_kind="shell", metadata={
            "code_arg_language": "shell", "code_arg_name": "command",
        })
        args = {"command": "python -c 'assert 1 + 1 == 2'"}
        self.assertEqual(self.policy.evaluate("shell", tool, args)[0].action, "ask")
        self.policy.allow_sandboxed_shell = True
        grant, _ = self.policy.evaluate("shell", tool, args)
        self.assertEqual(grant.action, "allow")
        self.assertTrue(grant.sandbox_only)
        for settings, action in (
            ({"sandbox": False}, "ask"),
            ({"mode": "read-only"}, "ask"),
            ({"rules": [{"tool": "shell", "action": "ask"}]}, "ask"),
            ({"rules": [{"tool": "shell", "action": "deny"}]}, "deny"),
        ):
            with self.subTest(settings=settings):
                self.configure(**settings)
                self.assertEqual(self.policy.evaluate("shell", tool, args)[0].action, action)

    def setUp(self):
        self.root = Path(self.enterContext(TemporaryDirectory())).resolve()
        self.project = self.root / "project"
        self.project.mkdir()
        self.config = self.root / "trusted/permissions.json"
        self.config.parent.mkdir()
        self.config.write_text('{}')
        self.enterContext(patch.dict("os.environ", {"CODER_PERMISSION_CONFIG": str(self.config)}))
        self.interaction = Interaction()
        self.policy = ExecutionPermissions(self.project, self.interaction, self.root / "state/sessions.db",
                                           self.root / "mcp.json")
        self.observed = []
        self.calls = []

    def configure(self, **settings):
        self.config.write_text(json.dumps(settings))

    def conversation(self, replies, *, tools=(), coder=False, sandbox=False):
        replies = iter(replies)
        def model(messages, info):
            self.observed.append(messages[:])
            return ModelResponse(parts=[next(replies)])
        workspace = RestrictedWorkspace(self.project, self.policy) if sandbox else LocalWorkspace(self.project)
        capabilities = [workspace, self.policy, HandleDeferredToolCalls(handler=self.policy.handle)]
        if coder:
            capabilities.append(Coder(repo_context=False, sub_agents=False, unrestricted_filesystem=True))
        return Conversation(Agent(FunctionModel(model), tools=tools, capabilities=capabilities),
                            "session", interaction=self.interaction)

    def external(self, value: str) -> str:
        self.calls.append(value)
        return "executed:" + value

    async def answer(self, conversation, choice="本次允许"):
        async def on_question(text):
            self.assertIn("工具审批", text)
            self.assertFalse(self.calls)
            conversation.feedback(choice)
        return on_question

    async def test_denied_and_unanswered_tools_never_execute(self):
        for decision in ("deny", "ask"):
            with self.subTest(decision=decision):
                self.configure(rules=[{"tool": "external", "action": decision}])
                conversation = self.conversation([ToolCallPart("external", {"value": "probe"}), TextPart("done")],
                                                 tools=[self.external])
                await conversation.send("do it")
                self.assertFalse(self.calls)

    async def test_approval_executes_once_and_custom_text_denies(self):
        for choice, expected in (("本次允许", ["probe"]), ("随便", []), ("拒绝", [])):
            self.calls.clear()
            conversation = self.conversation([ToolCallPart("external", {"value": "probe"}), TextPart("done")],
                                             tools=[self.external])
            await conversation.send("do it", on_question=await self.answer(conversation, choice))
            self.assertEqual(self.calls, expected)

    async def test_deny_beats_allow_and_cannot_be_overridden_by_full_mode(self):
        self.configure(mode="full", rules=[{"tool": "*", "action": "allow"}, {"tool": "external", "action": "deny"}])
        conversation = self.conversation([ToolCallPart("external", {"value": "probe"}), TextPart("done")],
                                         tools=[self.external])
        await conversation.send("do it")
        self.assertFalse(self.calls)

    async def test_policy_change_after_approval_invalidates_ticket(self):
        conversation = self.conversation([ToolCallPart("external", {"value": "probe"}), TextPart("done")],
                                         tools=[self.external])
        async def on_question(text):
            self.configure(mode="read-only")
            conversation.feedback("本次允许")
        await conversation.send("do it", on_question=on_question)
        self.assertFalse(self.calls)
        self.assertIn("批准已失效", str(self.observed[-1]))

    async def test_protected_file_and_outside_symlink_need_approval(self):
        secret = self.project / ".env"
        secret.write_text("SECRET")
        outside = self.root / "outside"
        outside.write_text("OUTSIDE")
        (self.project / "link").symlink_to(outside)
        for path in (".env", "link"):
            conversation = self.conversation([ToolCallPart("read_file", {"path": path}), TextPart("done")], coder=True)
            await conversation.send("read it")
            self.assertNotIn("SECRET", str(self.observed[-1]))
            self.assertNotIn("OUTSIDE", str(self.observed[-1]))

    async def test_normal_project_write_needs_no_approval(self):
        conversation = self.conversation([ToolCallPart("write_file", {"path": "hello.txt", "content": "hello"}),
                                          TextPart("done")], coder=True, sandbox=True)
        await conversation.send("write it")
        self.assertEqual((self.project / "hello.txt").read_text(), "hello")

    async def test_cancel_approval_leaves_no_ticket_or_side_effect(self):
        conversation = self.conversation([ToolCallPart("external", {"value": "probe"})], tools=[self.external])
        waiting = asyncio.Event()
        async def on_question(text):
            waiting.set()
        task = asyncio.create_task(conversation.send("do it", on_question=on_question))
        await asyncio.wait_for(waiting.wait(), 3)
        task.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await task
        self.assertFalse(self.calls)
        self.assertFalse(self.policy.pending)
        self.assertFalse(self.policy.tickets)

    async def test_remember_is_exact_and_only_available_when_trusted_rule_allows(self):
        self.configure(rules=[{"tool": "external", "action": "ask", "remember": True}])
        conversation = self.conversation([
            ToolCallPart("external", {"value": "one"}), TextPart("done"),
            ToolCallPart("external", {"value": "one"}), TextPart("done"),
            ToolCallPart("external", {"value": "two"}), TextPart("done"),
        ], tools=[self.external])
        asked = []
        async def on_question(text):
            asked.append(text)
            conversation.feedback("本会话允许相同调用")
        await conversation.send("first", on_question=on_question)
        await conversation.send("repeat", on_question=on_question)
        await conversation.send("changed", on_question=on_question)
        self.assertEqual(len(asked), 2)
        self.assertEqual(self.calls, ["one", "one", "two"])
        audit = self.policy.audit_path.read_text()
        self.assertIn("allow_remembered", audit)
        self.assertNotIn('"value"', audit)

    async def test_approved_file_target_changed_while_waiting_is_not_written(self):
        target = self.project / ".env"
        target.write_text("old")
        conversation = self.conversation([ToolCallPart("write_file", {"path": ".env", "content": "replacement"}),
                                          TextPart("done")], coder=True, sandbox=True)
        async def on_question(text):
            target.write_text("changed by someone else")
            conversation.feedback("本次允许")
        await conversation.send("write it", on_question=on_question)
        self.assertEqual(target.read_text(), "changed by someone else")
        self.assertIn("批准已失效", str(self.observed[-1]))

    async def test_permission_config_cannot_be_written_even_with_full_mode(self):
        self.configure(mode="full")
        original = self.config.read_text()
        conversation = self.conversation([ToolCallPart("write_file", {"path": str(self.config), "content": "{}"}),
                                          TextPart("done")], coder=True, sandbox=True)
        await conversation.send("change policy")
        self.assertEqual(self.config.read_text(), original)

    def test_redaction_covers_nested_credentials_and_file_content(self):
        from agent.permissions.config import redact
        text = redact({"headers": {"Authorization": "Bearer secret"}, "content": '{"token":"hidden"}'})
        self.assertNotIn("Bearer secret", text)
        self.assertNotIn("hidden", text)

    async def test_native_requires_approval_uses_same_handler(self):
        from pydantic_ai import Tool
        conversation = self.conversation([ToolCallPart("external", {"value": "native"}), TextPart("done")],
                                         tools=[Tool(self.external, requires_approval=True)])
        await conversation.send("do it", on_question=await self.answer(conversation))
        self.assertEqual(self.calls, ["native"])

    async def test_parameter_rule_does_not_allow_other_arguments(self):
        self.configure(rules=[{"tool": "external", "argument": "value", "pattern": "public:*", "action": "allow"}])
        conversation = self.conversation([
            ToolCallPart("external", {"value": "public:docs"}), TextPart("done"),
            ToolCallPart("external", {"value": "private:docs"}), TextPart("done"),
        ], tools=[self.external])
        await conversation.send("public")
        await conversation.send("private")
        self.assertEqual(self.calls, ["public:docs"])

    def test_corrupt_config_fails_closed(self):
        self.config.write_text('{"mode":"bad"}')
        with self.assertRaisesRegex(ValueError, "权限配置无效"):
            load_settings(self.config)
