import asyncio
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from pydantic_ai import Agent, Tool
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
        args = {"command": "pwd"}
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

    def test_desktop_recoverable_git_writes_are_automatic(self):
        tool = SimpleNamespace(tool_kind="shell", metadata={
            "code_arg_language": "shell", "code_arg_name": "command",
        })
        self.policy.allow_sandboxed_shell = True
        for command in ("git add .", "git commit -m fix", "cd . && git add .",
                        "git status && git add .", "/usr/bin/git -C . add file"):
            with self.subTest(command=command):
                decision, _ = self.policy.evaluate("shell", tool, {"command": command})
                self.assertEqual(decision.action, "allow")
                self.assertTrue(decision.sandbox_only)
        for command in ("git reset --hard", "git push --force", "git checkout -- file"):
            with self.subTest(command=command):
                decision, _ = self.policy.evaluate("shell", tool, {"command": command})
                self.assertEqual(decision.action, "ask")
        for command in ("git status --short", "git diff", "git log -1", "ls"):
            with self.subTest(command=command):
                decision, _ = self.policy.evaluate("shell", tool, {"command": command})
                self.assertEqual(decision.action, "allow")
                self.assertTrue(decision.sandbox_only)

    def test_destructive_shell_rules_precede_modes_and_allow(self):
        tool = SimpleNamespace(tool_kind="shell", metadata={
            "code_arg_language": "shell", "code_arg_name": "command",
        })
        self.policy.allow_sandboxed_shell = True
        for settings in ({}, {"mode": "full", "rules": [{"tool": "shell", "action": "allow"}]}):
            self.configure(**settings)
            for command in ("rm -rf *", "rm -rf ./*", "/bin/rm -fr ./*", "cd . && rm -rf *",
                            "rm -rf .", "rm -rf ~", "find . -delete", "git clean -fd",
                            "echo before > before.txt && rm -rf *"):
                with self.subTest(command=command, settings=settings):
                    self.assertEqual(self.policy.evaluate("shell", tool, {"command": command})[0].action, "deny")
            for command in ("rm -rf build/cache", "rm obsolete.txt", "> data.csv",
                            "cp -f a b", "git restore -- file", "python -c 'print(1)'"):
                with self.subTest(command=command, settings=settings):
                    self.assertEqual(self.policy.evaluate("shell", tool, {"command": command})[0].action, "ask")

    async def test_denied_compound_shell_does_not_run_earlier_segment(self):
        self.configure(mode="full", rules=[{"tool": "shell", "action": "allow"}])
        keep = self.project / "keep.txt"
        keep.write_text("keep")
        for command in ("echo before > before.txt && rm -rf *", "echo before > before.txt | head; rm -rf *"):
            with self.subTest(command=command):
                conversation = self.conversation([
                    ToolCallPart("shell", {"command": command}), TextPart("done"),
                ], coder=True, sandbox=True)
                await conversation.send("check denial")
                self.assertTrue(keep.exists())
                self.assertFalse((self.project / "before.txt").exists())
                self.assertIn("权限拒绝", str(self.observed[-1]))

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
        registered = []
        for tool in tools:
            tool = tool if isinstance(tool, Tool) else Tool(tool)
            tool.metadata = {**(tool.metadata or {}), "ani_network": "local"}
            registered.append(tool)
        return Conversation(Agent(FunctionModel(model), tools=registered, capabilities=capabilities),
                            "session", interaction=self.interaction)

    def external(self, value: str) -> str:
        self.calls.append(value)
        return "executed:" + value

    async def answer(self, conversation, choice="本次允许"):
        async def on_question(text):
            self.assertIn("工具审批", text)
            self.assertRegex(text, r'```json\n\{\n  "value": "(?:probe|native)"\n\}\n```')
            self.assertIn("允许此次调用？", text)
            self.assertNotIn("工作目录：", text)
            self.assertNotIn("参数：", text)
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

    async def test_denied_shell_context_preserves_command_and_denial_scope(self):
        command = "git -C sub add ."
        call = ToolCallPart("shell", {"command": command})
        conversation = self.conversation([call, TextPart("无法暂存")], coder=True, sandbox=True)

        async def reject(text):
            self.assertIn(command, text)
            conversation.feedback("拒绝")

        await conversation.send("暂存修改", on_question=reject)
        parts = [part for message in self.observed[-1] for part in message.parts]
        original = next(part for part in parts if isinstance(part, ToolCallPart)
                        and part.tool_call_id == call.tool_call_id)
        denied = next(part for part in parts if isinstance(part, ToolReturnPart)
                      and part.tool_call_id == call.tool_call_id)
        self.assertEqual(original.args_as_dict()["command"], command)
        self.assertEqual(denied.outcome, "denied")
        self.assertIn("不要通过更换目录、路径、参数或工具来重试同一操作", str(denied.content))

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
