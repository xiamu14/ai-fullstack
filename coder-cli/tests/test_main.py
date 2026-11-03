from contextlib import chdir, redirect_stderr
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from main import main


class EntryTests(unittest.TestCase):
    def test_only_sessionId_is_accepted_and_starts_tui_without_running_agent(self):
        with patch("sys.argv", ["main.py", "--sessionId", "demo"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.create_agent") as create, patch("main.ChatApp") as app, \
             patch("main.load_session_history", return_value=[]):
            main()
        self.assertEqual(app.call_args.args[0].session_id, "demo")
        self.assertEqual(app.call_args.args[0].history, [])
        create.return_value.run.assert_not_called()
        app.return_value.run.assert_called_once_with()

    def test_default_session_is_left_to_agent(self):
        with patch("sys.argv", ["main.py"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.create_agent"), patch("main.ChatApp") as app:
            main()
            main()
        ids = [call.args[0].session_id for call in app.call_args_list]
        self.assertEqual(ids, [None, None])

    def test_removed_arguments_and_invalid_ids_are_rejected_before_creating_files(self):
        with TemporaryDirectory() as directory, chdir(directory):
            for args in (["hello"], ["--session", "demo"], ["--sesionId", "demo"],
                         ["--sesion", "demo"], ["--sessionId", ""],
                         ["--sessionId", " "], ["--sessionId", "new"]):
                with self.subTest(args=args), patch("sys.argv", ["main.py", *args]), \
                     redirect_stderr(StringIO()), self.assertRaises(SystemExit) as stopped:
                    main()
                self.assertEqual(stopped.exception.code, 2)
            self.assertFalse(Path("workspace").exists())

    def test_piped_input_does_not_launch_tui(self):
        with patch("sys.argv", ["main.py"]), \
             patch("main.sys.stdin.isatty", return_value=False), \
             patch("main.create_agent") as create, redirect_stderr(StringIO()), \
             self.assertRaises(SystemExit) as stopped:
            main()
        self.assertEqual(stopped.exception.code, 2)
        create.assert_not_called()
