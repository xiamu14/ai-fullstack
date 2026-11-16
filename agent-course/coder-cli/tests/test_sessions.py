from contextlib import chdir, closing, redirect_stdout
from datetime import UTC, datetime, timedelta
from io import StringIO
from pathlib import Path
import subprocess
import sqlite3
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import ModelRequest, UserPromptPart
from pydantic_ai_harness.step_persistence import ContinuableSnapshot, RunRecord, SqliteStepStore, StepEvent, ToolEffectRecord
from textual.widgets import Button, DataTable

from main import main
from storage.sessions import SessionInfo, delete_session, list_sessions, load_session_history, save_session, session_database, session_workspace
from tui.sessions import SessionsApp


class SessionStoreTests(unittest.IsolatedAsyncioTestCase):
    async def test_empty_session_survives_reopen_preserves_workspace_and_can_be_deleted(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "state/sessions.db"
            workspace = Path(directory).resolve() / "example"
            workspace.mkdir()
            await save_session(database, "empty-id", workspace)
            self.assertEqual(await load_session_history(database, "empty-id"), [])
            self.assertEqual(await session_workspace(database, "empty-id", "/ignored"), workspace)
            await save_session(database, "empty-id", Path("/must-not-rebind"))
            self.assertEqual(await list_sessions(database), [SessionInfo("empty-id", "Untitled session", str(workspace))])
            store = SqliteStepStore(database=str(database))
            self.assertEqual(await store.list_runs(), [])
            await store.register_run(RunRecord(run_id="first-run", conversation_id="empty-id", metadata={"workspace": "/outdated-run-workspace"}))
            await store.save_snapshot(ContinuableSnapshot(
                run_id="first-run", step_index=1, messages=[ModelRequest(parts=[UserPromptPart("First task")])],
            ))
            rows = await list_sessions(database)
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0].title, "First task")
            self.assertEqual(rows[0].workspace, str(workspace))
            await delete_session(database, "empty-id")
            self.assertEqual(await list_sessions(database), [])

    async def test_empty_session_can_be_deleted_before_run_tables_exist(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            await save_session(database, "empty-id", Path(directory).resolve())
            await delete_session(database, "empty-id")
            self.assertEqual(await list_sessions(database), [])

    async def test_delete_removes_session_descendants_and_keeps_other_sessions_and_shared_messages(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(database))
            shared = ModelRequest(parts=[UserPromptPart("shared evidence")])
            for run_id, session_id, parent in (
                ("a-first", "a", None), ("a-next", "a", None),
                ("a-child", "child-session", "a-first"), ("a-grandchild", "grandchild-session", "a-child"),
                ("b-first", "b", None),
            ):
                await store.register_run(RunRecord(run_id=run_id, conversation_id=session_id, parent_run_id=parent))
                await store.append_event(StepEvent(run_id=run_id, kind="run_completed", step_index=1))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=run_id, conversation_id=session_id, step_index=1, idempotency_key="snapshot",
                    messages=[shared, ModelRequest(parts=[UserPromptPart(run_id)])],
                ))
                await store.record_tool_effect(ToolEffectRecord(
                    run_id=run_id, tool_call_id="tool", tool_name="read_file", status="completed",
                ))
            await delete_session(database, "a' OR 1=1 --")
            self.assertEqual(len(await store.list_runs()), 5)
            await delete_session(database, "a")
            await delete_session(database, "a")
            self.assertEqual([run.run_id for run in await store.list_runs()], ["b-first"])
            self.assertEqual(await load_session_history(database, "a"), [])
            history = await load_session_history(database, "b")
            self.assertEqual([part.content for message in history for part in message.parts
                              if isinstance(part, UserPromptPart)], ["shared evidence", "b-first"])
            with closing(sqlite3.connect(database)) as connection:
                for table in ("events", "snapshots", "snapshot_idempotency_keys", "tool_effects"):
                    self.assertEqual(connection.execute(f"SELECT DISTINCT run_id FROM {table}").fetchall(), [("b-first",)])
                self.assertEqual(connection.execute("SELECT count(*) FROM snapshot_messages").fetchone()[0], 2)
                self.assertEqual(connection.execute("SELECT count(*) FROM snapshot_message_refs").fetchone()[0], 2)

    async def test_failed_delete_rolls_back_all_changes_and_missing_database_stays_missing(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            await delete_session(database, "a")
            self.assertFalse(database.exists())
            store = SqliteStepStore(database=str(database))
            await save_session(database, "a", Path(directory).resolve())
            await store.register_run(RunRecord(run_id="a-first", conversation_id="a"))
            await store.append_event(StepEvent(run_id="a-first", kind="run_completed", step_index=1))
            await store.save_snapshot(ContinuableSnapshot(
                run_id="a-first", step_index=1, idempotency_key="snapshot",
                messages=[ModelRequest(parts=[UserPromptPart("keep evidence")])],
            ))
            await store.record_tool_effect(ToolEffectRecord(
                run_id="a-first", tool_call_id="tool", tool_name="shell", status="completed",
            ))
            with closing(sqlite3.connect(database)) as connection:
                connection.execute("""CREATE TRIGGER prevent_delete BEFORE DELETE ON sessions
                    BEGIN SELECT RAISE(ABORT, 'test failure'); END""")
            with self.assertRaisesRegex(sqlite3.IntegrityError, "test failure"):
                await delete_session(database, "a")
            self.assertEqual((await load_session_history(database, "a"))[0].parts[0].content, "keep evidence")
            self.assertIsNotNone(await store.get_tool_effect(run_id="a-first", tool_call_id="tool"))
            with closing(sqlite3.connect(database)) as connection:
                self.assertEqual(connection.execute("SELECT count(*) FROM snapshot_idempotency_keys").fetchone()[0], 1)

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
                ("a-first", "a", "修复登录\n保持兼容", {"workspace": "/projects/a"}),
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
                SessionInfo("a", "修复登录 保持兼容", "/projects/a"), SessionInfo("b", "明确标题", str(path.parent.resolve())),
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
                SessionInfo("empty-session", "Untitled session", str(path.parent.resolve())),
                SessionInfo("failed-session", "失败前的请求", str(path.parent.resolve())),
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
                 patch("sys.argv", ["main.py", "--sessions"]), \
                 patch("storage.sessions.SESSION_DATABASE", Path("workspace/sessions.db").resolve()), \
                 redirect_stdout(StringIO()) as output:
                main()
                self.assertIn("暂无", output.getvalue())
                self.assertFalse(Path("workspace").exists())
            create.assert_not_called()

    def test_interactive_sessions_opens_viewer_and_piped_output_preserves_full_id(self):
        rows = [SessionInfo("x" * 100, "示例标题", "/projects/example")]
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
                    self.assertIn("sessionId\ttitle\tworkspace", output.getvalue())
                    self.assertIn("/projects/example", output.getvalue())


class SessionsUiTests(unittest.IsolatedAsyncioTestCase):
    async def test_d_removes_selected_session_from_sqlite_and_reopened_listing(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / "sessions.db"
            store = SqliteStepStore(database=str(database))
            for session_id in ("first", "second"):
                await store.register_run(RunRecord(
                    run_id=session_id, conversation_id=session_id, metadata={"title": session_id},
                ))
                await store.append_event(StepEvent(run_id=session_id, kind="run_completed", step_index=1))
                await store.save_snapshot(ContinuableSnapshot(
                    run_id=session_id, step_index=1, messages=[ModelRequest(parts=[UserPromptPart(session_id)])],
                ))
            rows = await list_sessions(database)
            selected = rows[0].session_id
            with patch("storage.sessions.SESSION_DATABASE", database):
                app = SessionsApp(rows)
                async with app.run_test() as pilot:
                    await pilot.press("d")
                    await pilot.pause()
                    self.assertEqual(app.screen.query_one(DataTable).row_count, 1)
            self.assertNotIn(selected, [session.session_id for session in await list_sessions(database)])
            self.assertEqual(await load_session_history(database, selected), [])

    async def test_d_deletes_selected_row_and_empty_list_is_safe(self):
        first = "01a1a0f7-3dc2-766f-b8d7-09f03d780001"
        second = "01a1a0f7-3dc2-766f-b8d7-09f03d780002"
        rows = [SessionInfo(first, "首个标题", "/projects/first"), SessionInfo(second, "另一个标题", "/projects/second")]
        app = SessionsApp(rows)
        with patch("tui.sessions.delete_session") as delete, patch("tui.sessions.sys.platform", "linux"):
            async with app.run_test(size=(110, 32)) as pilot:
                table = app.screen.query_one(DataTable)
                self.assertEqual(table.get_row(first)[0].plain, "01a1a0f7…0001")
                self.assertEqual(table.get_row(second)[0].plain, "01a1a0f7…0002")
                self.assertEqual(table.get_row(second)[2].plain, "/projects/second")
                await pilot.press("down", "d")
                await pilot.pause()
                delete.assert_awaited_once_with(session_database(), second)
                self.assertEqual(app.screen.query_one(DataTable).row_count, 1)
                self.assertEqual([session.session_id for session in rows], [first])
                await pilot.press("c")
                self.assertEqual(app.clipboard, first)
                await pilot.press("d")
                await pilot.pause()
                self.assertEqual(app.screen.query_one(DataTable).row_count, 0)
                self.assertTrue(app.screen.query_one("#copy", Button).disabled)
                self.assertEqual(rows, [])
                await pilot.press("d")
                self.assertEqual(delete.await_count, 2)

    async def test_delete_failure_preserves_row_and_reports_error(self):
        rows = [SessionInfo("first-id", "首个标题")]
        app = SessionsApp(rows)
        with patch("tui.sessions.delete_session", side_effect=sqlite3.OperationalError("database is locked")):
            async with app.run_test() as pilot:
                with patch.object(app.screen, "notify") as notify:
                    await pilot.press("d")
                    await pilot.pause()
                    self.assertEqual(notify.call_args.kwargs["severity"], "error")
                    self.assertIn("database is locked", notify.call_args.args[0])
                self.assertEqual(app.screen.query_one(DataTable).row_count, 1)
                self.assertEqual(rows, [SessionInfo("first-id", "首个标题")])
                self.assertFalse(app.screen.query_one("#copy", Button).disabled)

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
