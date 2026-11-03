from contextlib import chdir, redirect_stdout
from datetime import UTC, datetime, timedelta
from io import StringIO
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import ModelRequest, UserPromptPart
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore
from textual.widgets import DataTable

from main import main
from sessions import SessionInfo, list_sessions
from tui.sessions import SessionsApp


class SessionStoreTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_database_does_not_create_workspace(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "workspace" / "sessions.db"
            self.assertEqual(await list_sessions(path), [])
            self.assertFalse(path.parent.exists())

    async def test_groups_runs_keeps_title_and_orders_by_latest_activity(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(path))
            now = datetime.now(UTC)
            runs = [
                ("a-first", "a", "修复登录\n保持兼容", {}),
                ("b-first", "b", "原始任务", {"title": "明确标题"}),
                ("a-second", "a", "继续验证", {}),
            ]
            for index, (run_id, session_id, prompt, metadata) in enumerate(runs):
                await store.register_run(RunRecord(
                    run_id=run_id, conversation_id=session_id, metadata=metadata,
                    started_at=now + timedelta(seconds=index),
                ))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=run_id, conversation_id=session_id, step_index=1,
                    messages=[ModelRequest(parts=[UserPromptPart(prompt)])],
                ))
            await store.register_run(RunRecord(run_id="child", conversation_id="child", parent_run_id="a-first"))
            self.assertEqual(await list_sessions(path), [
                SessionInfo("a", "修复登录 保持兼容"), SessionInfo("b", "明确标题"),
            ])

    async def test_failed_run_uses_interrupted_snapshot_and_empty_run_has_fallback(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(path))
            await store.register_run(RunRecord(run_id="failed", conversation_id="failed-session"))
            await store.save_snapshot(ContinuableSnapshot(
                run_id="failed", step_index=1, state="interrupted",
                messages=[ModelRequest(parts=[UserPromptPart("失败前的请求")])],
            ))
            await store.register_run(RunRecord(run_id="empty", conversation_id="empty-session"))
            self.assertEqual(await list_sessions(path), [
                SessionInfo("empty-session", "Untitled session"), SessionInfo("failed-session", "失败前的请求"),
            ])


class SessionsCliTests(unittest.TestCase):
    def test_help_and_sessions_need_no_agent_or_terminal(self):
        with patch("main.create_agent") as create:
            with patch("sys.argv", ["main.py", "--help"]), redirect_stdout(StringIO()) as output:
                with self.assertRaises(SystemExit) as stopped:
                    main()
                self.assertEqual(stopped.exception.code, 0)
                self.assertIn("--sessions", output.getvalue())
                self.assertIn("复制", output.getvalue())
            with TemporaryDirectory() as directory, chdir(directory), \
                 patch("sys.argv", ["main.py", "--sessions"]), redirect_stdout(StringIO()) as output:
                main()
                self.assertIn("暂无", output.getvalue())
                self.assertFalse(Path("workspace").exists())
            create.assert_not_called()

    def test_interactive_sessions_opens_viewer_and_piped_output_preserves_full_id(self):
        rows = [SessionInfo("x" * 100, "示例标题")]
        for interactive in (False, True):
            with self.subTest(interactive=interactive), \
                 patch("sys.argv", ["main.py", "--sessions"]), \
                 patch("main.list_sessions", return_value=rows), \
                 patch("main.sys.stdin.isatty", return_value=interactive), \
                 patch("main.SessionsApp") as app, redirect_stdout(StringIO()) as output, \
                 patch("main.sys.stdout.isatty", return_value=interactive):
                main()
                if interactive:
                    app.assert_called_once_with(rows)
                    app.return_value.run.assert_called_once_with()
                else:
                    app.assert_not_called()
                    self.assertIn(rows[0].session_id, output.getvalue())
                    self.assertIn("示例标题", output.getvalue())


class SessionsUiTests(unittest.IsolatedAsyncioTestCase):
    async def test_selection_and_c_copy_exact_id_using_macos_clipboard(self):
        rows = [SessionInfo("first-id", "首个标题"), SessionInfo("second-id", "另一个标题")]
        app = SessionsApp(rows)
        with patch("tui.sessions.sys.platform", "darwin"), patch("tui.sessions.subprocess.run") as copy:
            async with app.run_test(size=(110, 32)) as pilot:
                self.assertIsInstance(app.focused, DataTable)
                await pilot.press("down", "c")
                await pilot.pause()
                self.assertEqual(copy.call_args.kwargs["input"], "second-id")
                self.assertEqual(copy.call_args.args[0], ["/usr/bin/pbcopy"])
                self.assertTrue(copy.call_args.kwargs["check"])
                copy.reset_mock()
                await pilot.click("#copy")
                self.assertEqual(copy.call_args.kwargs["input"], "second-id")

    async def test_non_macos_uses_terminal_clipboard_and_empty_list_is_safe(self):
        app = SessionsApp([SessionInfo("full-session-id", "标题")])
        with patch("tui.sessions.sys.platform", "linux"):
            async with app.run_test() as pilot:
                await pilot.press("c")
                self.assertEqual(app.clipboard, "full-session-id")
        empty = SessionsApp([])
        async with empty.run_test() as pilot:
            await pilot.press("c")
            self.assertEqual(empty.clipboard, "")

    async def test_copy_failure_is_reported_without_exiting_viewer(self):
        app = SessionsApp([SessionInfo("session-id", "标题")])
        with patch("tui.sessions.sys.platform", "darwin"), \
             patch("tui.sessions.subprocess.run", side_effect=subprocess.CalledProcessError(1, "pbcopy")):
            async with app.run_test() as pilot:
                with patch.object(app.screen, "notify") as notify:
                    await pilot.press("c")
                    await pilot.pause()
                    self.assertEqual(notify.call_args.kwargs["severity"], "error")
                    self.assertTrue(app.is_running)
