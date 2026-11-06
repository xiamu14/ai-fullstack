"""Linked worktree Git metadata remains usable under the existing OS sandbox."""
from pathlib import Path
import unittest
from unittest.mock import patch

from agent.interaction import Interaction
from agent.permissions.policy import CURRENT_GRANT, ExecutionPermissions
from agent.permissions.rules import Decision
from agent.permissions.workspace import RestrictedBackend
from storage.worktrees import Worktrees, git
from tests import test_multi_agent as fixtures


class WorktreePermissionTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = fixtures.MultiAgentTests.asyncSetUp

    async def test_approved_git_can_commit_inside_linked_worktree(self):
        worktrees = Worktrees(self.root / "trees", self.repo)
        record = await worktrees.allocate("approved-git")
        root = Path(record.path)
        policy_path = self.root / "permissions.json"
        policy_path.write_text('{"sandbox":true}')
        with patch.dict("os.environ", {"CODER_PERMISSION_CONFIG": str(policy_path)}):
            policy = ExecutionPermissions(root, Interaction(), self.root / "state/sessions.db", self.root / "mcp.json")
            backend = RestrictedBackend(root, policy)
            self.addCleanup(backend.close)
            (root / "sample.py").write_text("VALUE = 9\n")
            token = CURRENT_GRANT.set(Decision("allow", "test approval", "git add sample.py", command=True))
            try:
                added = await backend.run(["git", "add", "sample.py"])
                self.assertEqual(added.exit_code, 0, added.stderr)
                committed = await backend.run(["git", "commit", "-m", "implementation"])
                self.assertEqual(committed.exit_code, 0, committed.stderr)
            finally:
                CURRENT_GRANT.reset(token)
        self.assertNotEqual(git(root, "rev-parse", "HEAD"), record.baseline)
        self.assertEqual(worktrees.validate(record.path).baseline, record.baseline)
        self.assertEqual((self.repo / "sample.py").read_text(), "VALUE = 1\n")
