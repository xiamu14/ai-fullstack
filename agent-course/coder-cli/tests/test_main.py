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
             patch("main.create_agent") as create, patch("main.ChatShell") as app:
            app.return_value.return_code = 0
            self.assertEqual(main(), 0)
        create.assert_awaited_once_with("demo", None)
        app.assert_called_once_with(create.return_value)
        create.return_value.send.assert_not_called()
        app.return_value.run.assert_called_once_with()

    def test_default_session_is_left_to_agent(self):
        with patch("sys.argv", ["main.py"]), \
             patch("main.sys.stdin.isatty", return_value=True), \
             patch("main.sys.stdout.isatty", return_value=True), \
             patch("main.create_agent") as create, patch("main.ChatShell") as app:
            main()
            main()
        self.assertEqual([call.args for call in create.await_args_list], [(None, None), (None, None)])

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
