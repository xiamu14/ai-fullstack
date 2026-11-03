from contextlib import redirect_stderr
from io import StringIO
import sqlite3
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

from main import main
from tui.shell import ChatShell


class EntryErrorTests(unittest.TestCase):
    def test_session_database_error_is_reported(self):
        with patch("sys.argv", ["main.py", "--sessions"]), \
             patch("main.list_sessions", side_effect=sqlite3.OperationalError("database is locked")), \
             redirect_stderr(StringIO()) as output, self.assertRaises(SystemExit) as stopped:
            main()
        self.assertEqual(stopped.exception.code, 1)
        self.assertIn("database is locked", output.getvalue())

    def test_programming_errors_in_listing_and_factory_propagate(self):
        for args, target in ((["--sessions"], "main.list_sessions"), ([], "main.create_agent")):
            with self.subTest(target=target), patch("sys.argv", ["main.py", *args]), \
                 patch("main.sys.stdin.isatty", return_value=True), \
                 patch("main.sys.stdout.isatty", return_value=True), \
                 patch(target, side_effect=TypeError("programming bug")), \
                 self.assertRaisesRegex(TypeError, "programming bug"):
                main()


class ShellErrorTests(unittest.IsolatedAsyncioTestCase):
    async def test_programming_error_propagates_after_cleanup(self):
        conversation = SimpleNamespace(session_id=None, history=[], send=AsyncMock(side_effect=TypeError("bug")))
        shell = ChatShell(conversation)
        async with shell.run_test():
            with self.assertRaisesRegex(TypeError, "bug"):
                await ChatShell.run_turn.__wrapped__(shell, "任务")
            self.assertFalse(shell.busy)
            self.assertEqual(list(shell.query(".error")), [])

    async def test_group_handles_only_operational_errors_and_redacts_leaf_details(self):
        error = ExceptionGroup("mixed", [
            ExceptionGroup("storage", [OSError("disk failure secret-key")]),
            TypeError("programming bug"),
        ])
        conversation = SimpleNamespace(session_id=None, history=[], send=AsyncMock(side_effect=error))
        shell = ChatShell(conversation)
        with patch.dict("os.environ", {"OPENAI_API_KEY": "secret-key"}):
            async with shell.run_test():
                with self.assertRaises(ExceptionGroup) as remaining:
                    await ChatShell.run_turn.__wrapped__(shell, "任务")
                self.assertEqual(len(remaining.exception.exceptions), 1)
                self.assertIsInstance(remaining.exception.exceptions[0], TypeError)
                content = list(shell.query(".error"))[0].content
                self.assertIn("disk failure", content)
                self.assertNotIn("secret-key", content)
                self.assertFalse(shell.busy)
