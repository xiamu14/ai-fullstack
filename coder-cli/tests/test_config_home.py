from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from integrations.config_home import config_home, user_config


class ConfigHomeTests(TestCase):
    def setUp(self):
        self.home = Path(self.enterContext(TemporaryDirectory()))
        self.enterContext(patch("pathlib.Path.home", return_value=self.home))
        self.target = self.home / ".config/.ani bot"

    def test_moves_entire_tree_once(self):
        old = self.home / ".config/.coder-cli"
        (old / "nested").mkdir(parents=True)
        (old / "nested/item").write_text("setting")
        self.assertEqual(config_home(), self.target)
        self.assertFalse(old.exists())
        self.assertEqual((self.target / "nested/item").read_text(), "setting")
        self.assertEqual(config_home(), self.target)

    def test_existing_target_and_old_directory_conflict(self):
        old = self.home / ".config/.coder-cli"
        old.mkdir(parents=True)
        self.target.mkdir()
        with self.assertRaises(FileExistsError):
            config_home()
        self.assertTrue(old.is_dir())
        self.assertTrue(self.target.is_dir())

    def test_default_and_explicit_paths(self):
        with patch.dict("os.environ", {"TEST_CONFIG": "~/override.json", "HOME": str(self.home)}):
            self.assertEqual(user_config("TEST_CONFIG", "mcp.json"), (self.home / "override.json").resolve())
        self.assertEqual(user_config("TEST_MISSING", "mcp.json"), (self.target / "mcp.json").resolve())
