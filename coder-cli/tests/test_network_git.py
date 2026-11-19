from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import AsyncMock, patch

from agent.permissions.config import Settings
from agent.permissions.shell_rules import classify_shell
from integrations.git_push import prepare_push, push_command, run_git, send_push
from integrations.network import NetworkDenied
from storage.worktrees import git


class GitNetworkTests(unittest.IsolatedAsyncioTestCase):
    def test_destructive_push_still_requires_operation_approval(self):
        root = Path.cwd()
        for command in ("git push --force origin main", "git push --delete origin main"):
            with self.subTest(command=command):
                self.assertEqual(classify_shell(command, root, Settings()).action, "ask")
        self.assertEqual(classify_shell("git push origin main", root, Settings()).action, "allow")
        self.assertIsNone(push_command("git push --delete origin a:b"))
        self.assertIsNone(push_command("git push --mirror origin"))
        self.assertIsNone(push_command("git push origin main other"))

    def repository(self, root):
        git(root, "init")
        git(root, "config", "user.name", "Test")
        git(root, "config", "user.email", "test@example.invalid")
        (root / "sample").write_text("public")
        git(root, "add", ".")
        git(root, "commit", "-m", "first")
        git(root, "remote", "add", "origin", "https://example.com/repo.git")

    async def test_annotated_tag_contents_are_scanned(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.repository(root)
            git(root, "tag", "-a", "release", "-m", "password=private")
            push = push_command("git push origin refs/tags/release")
            prepared = await prepare_push(root, push)
            with patch("integrations.git_push.NetworkPolicy.resolve", new_callable=AsyncMock) as resolve:
                with self.assertRaises(NetworkDenied):
                    await send_push(root, push, prepared)
                resolve.assert_not_awaited()

    async def test_ref_change_prevents_connecting(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.repository(root)
            push = push_command("git push origin HEAD:main")
            prepared = await prepare_push(root, push)
            (root / "sample").write_text("updated public")
            git(root, "add", ".")
            git(root, "commit", "-m", "second")
            with patch("integrations.git_push.NetworkPolicy.resolve", new_callable=AsyncMock) as resolve:
                with self.assertRaises(NetworkDenied):
                    await send_push(root, push, prepared)
                resolve.assert_not_awaited()

    async def test_deletion_sends_no_objects(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.repository(root)
            push = push_command("git push --delete origin main")
            prepared = await prepare_push(root, push)
            sent = []

            async def execute(repo, *args, **kwargs):
                if "push" in args:
                    sent.append(args)
                    return b""
                return await run_git(repo, *args, **kwargs)

            with patch("integrations.git_push.run_git", side_effect=execute), patch(
                "integrations.git_push.prepare_objects", new_callable=AsyncMock,
            ) as scan, patch("integrations.git_push.NetworkPolicy.resolve", new_callable=AsyncMock,
                             return_value="93.184.216.34"):
                await send_push(root, push, prepared)
                scan.assert_not_awaited()
            self.assertEqual(sent[0][-1], ":refs/heads/main")
