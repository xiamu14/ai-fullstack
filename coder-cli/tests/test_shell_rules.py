from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from agent.permissions.config import Settings
from agent.permissions.shell_rules import classify_shell
from integrations.shell_network import unsupported_network


class ShellRulesTests(unittest.TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name).resolve()
        (self.root / "sub").mkdir()
        self.settings = Settings()

    def classify(self, command):
        return classify_shell(command, self.root, self.settings)

    def test_readonly_chains_and_pipelines_are_automatic(self):
        commands = (
            f"cd {self.root} && pwd && ls -la | head -40",
            "ls -la | head -40", "pwd; ls -la | head -40;", "false || ls | wc -l",
            "cd sub && pwd && ls | head -40", "pwd && ls || head -40 file",
            "git status --short | head -40", "cat file | head | wc -l",
        )
        for command in commands:
            with self.subTest(command=command):
                self.assertEqual(self.classify(command).action, "allow")

    def test_quoted_and_escaped_operators_remain_arguments(self):
        for command in ("echo '|'", 'echo "a|b;&&c"', "echo a'|'b", r"echo \|", "echo ';' 'curl'",
                        "printf '%s' '$(rm -rf *)'", 'echo "\\$literal"', "echo '#'", "ls # note"):
            with self.subTest(command=command):
                self.assertEqual(self.classify(command).action, "allow")
                self.assertIsNone(unsupported_network(command))
        self.assertEqual(self.classify("git commit -m 'fix | shell; parser'").action, "allow")
        self.assertEqual(self.classify("printf '>' > output.txt").action, "ask")
        for command in ("git log --grep push | head", "git commit -m push"):
            self.assertIsNone(unsupported_network(command))

    def test_git_reads_in_workspace_subdirectories(self):
        command = f'cd "{self.root}" && git -C sub status --short | head -30; git -C sub log -1 | head -30'
        self.assertEqual(self.classify(command).action, "allow")
        self.assertEqual(self.classify("git -C sub clean -n").action, "allow")
        self.assertEqual(self.classify("git -C sub clean -fd").action, "deny")
        self.assertEqual(self.classify("git -C .. status").action, "ask")
        self.assertFalse(self.classify("git -C sub add .").git_write)

    def test_stdout_stderr_copy_never_grants_file_access(self):
        command = f'cd {self.root} && git status 2>&1 | head -50; echo "---"; git log --oneline -5 2>&1'
        self.assertEqual(self.classify(command).action, "allow")
        self.assertIsNone(unsupported_network(command))
        self.assertEqual(self.classify("git status 1>&2").action, "allow")
        self.assertEqual(self.classify("git status 2>&1 > output.txt").targets, (self.root / "output.txt",))
        self.assertEqual(self.classify("git status 2>&1 > .git/config").action, "deny")
        self.assertEqual(self.classify("git status 2>&1; rm -rf *").action, "deny")
        for command in ('git status "2">&1', 'git status 2>&1file', 'git status 2>&3'):
            with self.subTest(command=command):
                self.assertEqual(self.classify(command).action, "ask")
        self.assertIsNotNone(unsupported_network("curl https://example.com 2>&1"))

    def test_unknown_stage_has_specific_reason_and_no_write_grant(self):
        for command, reason in (
            ("pwd | custom_program", "第 2 段"),
            ("ls && python script.py", "python"),
            ("ls $(pwd)", "命令替换"),
            ('rm "$target"', "变量展开"),
            ('"$program" status', "变量展开"),
            ('echo ok > "$target"', "变量展开"),
            ("ls &", "后台"),
            ("cd sub* && ls", "cd 参数"),
            ("cd ~ && ls", "cd 参数"),
            ("ls < file", "操作符 <"),
            ("ls &&", "缺少命令"),
            ("echo 'unfinished", "引号"),
        ):
            with self.subTest(command=command):
                operation = self.classify(command)
                self.assertEqual(operation.action, "ask")
                self.assertIn(reason, operation.reason)
                self.assertFalse(operation.targets)
                self.assertFalse(operation.git_write)
        operation = self.classify("custom_program; rm obsolete.txt")
        self.assertEqual(operation.action, "ask")
        self.assertFalse(operation.targets)

    def test_deny_dominates_entire_command(self):
        for command in ("pwd | head; rm -rf *", "echo before > proof && rm -rf *", "ls || rm -rf *",
                        "cd sub || rm -rf .", "cd sub*; rm -rf *", "echo '|' && git clean -fd",
                        "git log --output=.git/config; git add .", "cd sub > .git/config"):
            with self.subTest(command=command):
                self.assertEqual(self.classify(command).action, "deny")

    def test_redirect_and_delete_targets_follow_cd_branches(self):
        direct = self.classify("cd sub && ls | head > output.txt")
        self.assertEqual(direct.action, "ask")
        self.assertEqual(direct.targets, (self.root / "sub/output.txt",))
        conditional = self.classify("cd sub || rm old.txt")
        self.assertEqual(conditional.targets, (self.root / "old.txt",))
        sequential = self.classify("cd sub; rm old.txt")
        self.assertEqual(set(sequential.targets), {self.root / "old.txt", self.root / "sub/old.txt"})
        pipeline = self.classify("cd sub | cat; rm old.txt")
        self.assertEqual(pipeline.targets, (self.root / "old.txt",))
        quoted = self.classify("echo '>'")
        self.assertEqual(quoted.action, "allow")
        self.assertFalse(quoted.targets)

    def test_git_metadata_and_network_boundaries_are_preserved(self):
        self.assertTrue(self.classify("git status && git add . && git commit -m fix").git_write)
        for command in ("git add . | head", "echo before; git add ."):
            with self.subTest(command=command):
                operation = self.classify(command)
                self.assertEqual(operation.action, "ask")
                self.assertFalse(operation.git_write)
        self.assertIsNotNone(unsupported_network("ls | curl https://example.com"))
        self.assertIsNotNone(unsupported_network("curl https://example.com | head"))
        self.assertIsNotNone(unsupported_network("ls && curl https://example.com &"))
        self.assertEqual(self.classify("./cd sub && git add .").action, "ask")
        self.assertFalse(self.classify("./cd sub && git add .").git_write)
        self.assertFalse(self.classify("git log *; git add .").git_write)
        self.assertEqual(self.classify("git commit -m '*'").action, "allow")

    def test_variable_risk_depends_on_the_operation(self):
        probe = 'for d in */ ; do if [ -d "$d/.git" ]; then echo "REPO: $d"; fi; done'
        for command in ('ls "$HOME"', 'echo "REPO: $d"', 'test -d "${d}/.git"',
                        f'cd {self.root} && {probe}; ls -la | head -30'):
            with self.subTest(command=command):
                self.assertEqual(self.classify(command).action, "allow")
        for command in (probe.replace('echo "REPO: $d"', 'rm "$d"'),
                        probe.replace('$d/.git', '$(pwd)/.git'),
                        'cd "$dir" && git add .',
                        'git log --output="$target"', 'git add "$target"'):
            with self.subTest(command=command):
                operation = self.classify(command)
                self.assertNotEqual(operation.action, "allow")
                self.assertFalse(operation.targets)
                self.assertFalse(operation.git_write)
        self.assertIsNotNone(unsupported_network('curl "$url"'))
        self.assertIsNotNone(unsupported_network(probe.replace('echo "REPO: $d"', 'curl "$url"')))
        self.assertIsNotNone(unsupported_network('if true; then curl --offline "$url"; fi'))
        self.assertEqual(self.classify("if true; then rm -rf *; fi").action, "deny")
        self.assertEqual(self.classify(probe.replace('echo "REPO: $d"', 'rm -rf *')).action, "deny")
