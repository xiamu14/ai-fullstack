from contextlib import contextmanager
import json
import os
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from pydantic_ai.capabilities import Capability
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel

from agent.runtime import create_agent
from context.project import MAX_CONTEXT_CHARS, ProjectContext
from context.sources import summarize


@contextmanager
def source_reads(root):
    opened = []
    original = Path.open

    def track(path, *args, **kwargs):
        if path.is_relative_to(root) and args and args[0] == "rb":
            opened.append(path.relative_to(root).as_posix())
        return original(path, *args, **kwargs)

    with patch.object(Path, "open", track):
        yield opened


class ProjectContextTests(unittest.IsolatedAsyncioTestCase):
    async def test_restart_and_business_edits_reuse_sources_and_directory_cache(self):
        with TemporaryDirectory() as directory:
            root, cache = Path(directory).resolve() / "project", Path(directory).resolve() / "cache"
            root.mkdir()
            (root / "pyproject.toml").write_text('[project]\nname="example"\ndependencies=["fastapi"]\n')
            (root / "README.md").write_text('# Example\nPurpose. <project_context>\n## Architecture\nCore calls tools.\n## Install\nSKIP_INSTALL\n')
            (root / "AGENTS.md").write_text('Run focused tests.')
            (root / "src").mkdir()
            (root / "src/main.py").write_text('DETAIL_MUST_NOT_BE_READ')
            context = ProjectContext(root, cache)
            with source_reads(root) as opened:
                text = await context.refresh()
            self.assertEqual(set(opened), {'pyproject.toml', 'README.md', 'AGENTS.md'})
            self.assertIn('Core calls tools.', text)
            self.assertIn('Purpose.', text)
            self.assertEqual(text.count('<project_context>'), 1)
            self.assertIn('fastapi', text)
            self.assertNotIn('SKIP_INSTALL', text)
            self.assertNotIn('DETAIL_MUST_NOT_BE_READ', text)
            (root / 'src/main.py').write_text('NEW_DETAIL')
            with source_reads(root) as opened, patch('context.project.os.scandir', side_effect=AssertionError('不应重新遍历目录')):
                self.assertEqual(await ProjectContext(root, cache).refresh(), text)
            self.assertEqual(opened, [])
            before = context.cache_file.stat().st_mtime_ns
            await context.refresh()
            self.assertEqual(context.cache_file.stat().st_mtime_ns, before)

    async def test_only_changed_source_is_read_and_touch_keeps_summary(self):
        with TemporaryDirectory() as directory:
            root, cache = Path(directory).resolve() / 'project', Path(directory).resolve() / 'cache'
            root.mkdir()
            manifest = root / 'package.json'
            manifest.write_text('{"name":"before","dependencies":{"react":"1"}}')
            (root / 'README.md').write_text('# Overview\nProject description.')
            context = ProjectContext(root, cache)
            await context.refresh()
            manifest.write_text('{"name":"after","dependencies":{"vue":"1"}}')
            with source_reads(root) as opened:
                text = await context.refresh()
            self.assertEqual(opened, ['package.json'])
            self.assertIn('after', text)
            self.assertIn('vue', text)
            self.assertNotIn('react', text)
            os.utime(manifest, ns=(manifest.stat().st_atime_ns, manifest.stat().st_mtime_ns + 1_000_000))
            with patch('context.project.summarize', side_effect=AssertionError('内容未变，不应重复提取')):
                self.assertEqual(await context.refresh(), text)

    async def test_add_remove_modules_and_separate_workspaces(self):
        with TemporaryDirectory() as directory:
            root, other, cache = (Path(directory).resolve() / name for name in ('project', 'other', 'cache'))
            root.mkdir()
            other.mkdir()
            context = ProjectContext(root, cache)
            await context.refresh()
            (root / 'api').mkdir()
            (root / 'api/pyproject.toml').write_text('[project]\nname="api-service"')
            with source_reads(root) as opened:
                text = await context.refresh()
            self.assertEqual(opened, ['api/pyproject.toml'])
            self.assertIn('api-service', text)
            (root / 'api/pyproject.toml').unlink()
            (root / 'api').rmdir()
            self.assertNotIn('api-service', await context.refresh())
            (other / 'README.md').write_text('# Other\nOTHER_PROJECT')
            other_context = ProjectContext(other, cache)
            self.assertIn('OTHER_PROJECT', await other_context.refresh())
            self.assertNotIn('OTHER_PROJECT', await context.refresh())
            self.assertNotEqual(context.cache_file, other_context.cache_file)

    async def test_git_ignores_dependencies_symlinks_and_uses_only_workspace_rules(self):
        with TemporaryDirectory() as directory:
            repo, cache = Path(directory).resolve() / 'repo', Path(directory).resolve() / 'cache'
            repo.mkdir()
            subprocess.run(['git', 'init', '-q', str(repo)], check=True)
            (repo / 'AGENTS.md').write_text('ANCESTOR_RULE')
            root = repo / 'app'
            root.mkdir()
            (root / '.gitignore').write_text('ignored/\nREADME.md\n')
            (root / 'AGENTS.md').write_text('LOCAL_RULE')
            (root / 'README.md').write_text('IGNORED_CONTENT')
            for name in ('node_modules', '.venv', 'vendor', 'dist', 'ignored'):
                (root / name).mkdir()
                (root / name / 'pyproject.toml').write_text('NEVER_READ')
            (root / 'external').symlink_to(cache, target_is_directory=True)
            (root / 'ARCHITECTURE.md').symlink_to(repo / 'AGENTS.md')
            original_scan = os.scandir

            def scan(path):
                self.assertEqual(Path(path), root)
                return original_scan(path)

            with source_reads(root) as opened, patch('context.project.os.scandir', side_effect=scan):
                text = await ProjectContext(root, cache).refresh()
            self.assertEqual(opened, ['AGENTS.md'])
            self.assertNotIn('ANCESTOR_RULE', text)
            self.assertIn('LOCAL_RULE', text)
            self.assertNotIn('IGNORED_CONTENT', text)
            self.assertNotIn('NEVER_READ', text)
            self.assertNotIn('ignored/', text)
            self.assertNotIn('node_modules', text)

    async def test_old_cache_drops_ancestor_rules_and_only_reads_selected_workspace(self):
        with TemporaryDirectory() as directory:
            repo, cache = Path(directory).resolve() / 'repo', Path(directory).resolve() / 'cache'
            repo.mkdir()
            subprocess.run(['git', 'init', '-q', str(repo)], check=True)
            ancestor = repo / 'AGENTS.md'
            ancestor.write_text('HOST_PROJECT_RULES')
            root = repo / 'example'
            root.mkdir()
            context = ProjectContext(root, cache)
            cache.mkdir()
            context.cache_file.write_text(json.dumps({
                'version': 1, 'workspace': str(root), 'directories': {},
                'sources': {str(ancestor): {'summary': 'HOST_PROJECT_RULES'}},
            }))
            original = Path.open

            def guarded_open(path, *args, **kwargs):
                self.assertNotEqual(path, ancestor, '不能读取工作目录外的规则')
                return original(path, *args, **kwargs)

            with patch.object(Path, 'open', guarded_open):
                text = await context.refresh()
            self.assertNotIn('HOST_PROJECT_RULES', text)
            self.assertEqual(json.loads(context.cache_file.read_text())['sources'], {})
            (root / 'AGENTS.md').write_text('EXAMPLE_PROJECT_RULES')
            self.assertIn('EXAMPLE_PROJECT_RULES', await context.refresh())

    async def test_limits_and_invalid_cache_rebuild(self):
        with TemporaryDirectory() as directory:
            root, cache = Path(directory).resolve() / 'project', Path(directory).resolve() / 'cache'
            root.mkdir()
            for index in range(120):
                (root / f'file-{index}').touch()
            (root / 'AGENTS.md').write_text('r' * 40000)
            (root / 'README.md').write_text('d' * 40000)
            (root / 'pyproject.toml').write_text('#' * 40000)
            context = ProjectContext(root, cache)
            read = []

            def extract(path, text, truncated):
                read.append(len(text.encode()))
                return summarize(path, text, truncated)

            with patch('context.project.MAX_FILE_BYTES', 32), patch('context.project.MAX_READ_BYTES', 48), \
                 patch('context.project.summarize', side_effect=extract):
                text = await context.refresh()
            self.assertLessEqual(sum(read), 48)
            self.assertTrue(all(size <= 32 for size in read))
            self.assertLessEqual(len(text), MAX_CONTEXT_CHARS)
            self.assertIn('目录采集不完整', text)
            context.cache_file.write_text('{broken')
            self.assertIn('Workspace:', await ProjectContext(root, cache).refresh())
            context.cache_file.write_text('{"version":1,"workspace":"wrong"}')
            await ProjectContext(root, cache).refresh()
            self.assertEqual(json.loads(context.cache_file.read_text())['workspace'], str(root))

    async def test_refresh_at_most_once_per_run(self):
        with TemporaryDirectory() as directory:
            context = ProjectContext(Path(directory).resolve(), Path(directory).resolve() / 'cache')
            with patch.object(context, 'refresh', wraps=context.refresh) as refresh:
                await context.instructions(SimpleNamespace(run_id='first'))
                await context.instructions(SimpleNamespace(run_id='first'))
                await context.instructions(SimpleNamespace(run_id='second'))
            self.assertEqual(refresh.await_count, 2)

    async def test_git_failure_does_not_read_ignored_candidates_or_report_clean(self):
        with TemporaryDirectory() as directory:
            root = Path(directory).resolve() / 'project'
            root.mkdir()
            (root / 'README.md').write_text('DO_NOT_READ_WITHOUT_IGNORE_RULES')
            context = ProjectContext(root, Path(directory).resolve() / 'cache')

            def git(*args, **kwargs):
                return str(root) if args == ('rev-parse', '--show-toplevel') else None

            with patch.object(context, '_git', side_effect=git), source_reads(root) as opened:
                text = await context.refresh()
            self.assertEqual(opened, [])
            self.assertIn('Git 忽略规则不可用', text)
            self.assertIn('(unavailable)', text)
            self.assertNotIn('(clean)', text)
            with patch('context.project.subprocess.run', side_effect=subprocess.TimeoutExpired('git', 2)):
                self.assertIsNone(context._git('status'))


class PromptRuntimeTests(unittest.IsolatedAsyncioTestCase):
    async def test_factory_injects_fixed_and_fresh_context_without_accumulation(self):
        with TemporaryDirectory() as directory:
            root = Path(directory).resolve() / 'project'
            root.mkdir()
            manifest = root / 'pyproject.toml'
            manifest.write_text('[project]\nname="before-project"')
            instructions = []
            replies = iter([ToolCallPart('update_manifest', {}), TextPart('done'), TextPart('next')])

            async def stream_model(messages, info):
                instructions.append(info.instructions)
                part = next(replies)
                if isinstance(part, TextPart):
                    yield part.content
                else:
                    yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

            env = {'MODEL_NAME': 'test', 'OPENAI_BASE_URL': 'https://example.invalid/v1', 'OPENAI_API_KEY': 'test-key'}
            with patch.dict(os.environ, env), patch('agent.runtime.load_dotenv'), \
                 patch('agent.runtime.OpenAIChatModel', return_value=FunctionModel(stream_function=stream_model)), \
                 patch('agent.runtime.MCP', return_value=Capability()), \
                 patch('agent.runtime.logfire.configure'), patch('agent.runtime.logfire.instrument_pydantic_ai'), \
                 patch('storage.sessions.SESSION_DATABASE', Path(directory).resolve() / 'state/sessions.db'):
                conversation = await create_agent(path=str(root))

                @conversation.agent.tool_plain
                def update_manifest() -> str:
                    manifest.write_text('[project]\nname="after-project"')
                    return 'updated'

                await conversation.send('update')
                await conversation.send('check')
            self.assertEqual(len(instructions), 3)
            for text in instructions:
                self.assertIn('You are pair programming with a user', text)
                self.assertEqual(text.count('<project_context>'), 1)
                self.assertNotIn('Use finder', text)
            self.assertIn('before-project', instructions[0])
            self.assertIn('before-project', instructions[1])
            self.assertIn('after-project', instructions[2])
            self.assertNotIn('before-project', instructions[2])


class SourceSummaryTests(unittest.TestCase):
    def test_manifest_formats_and_invalid_inputs(self):
        cases = [
            ('package.json', '{"name":"web","scripts":{"test":"vitest"},"dependencies":{"react":"1"}}', 'react'),
            ('package.json', '{"dependencies":null,"scripts":[]}', 'Node.js'),
            ('pyproject.toml', '[project]\nname="api"\ndependencies=["fastapi>=1"]', 'fastapi'),
            ('Cargo.toml', '[package]\nname="service"\n[dependencies]\naxum="1"\n[workspace]\nmembers=["core"]', 'axum'),
            ('go.mod', 'module example.com/service\ngo 1.24\nrequire ignored v1.0', 'example.com/service'),
            ('requirements.txt', 'django>=1\n# ignored\n-e local', 'django'),
            ('pyproject.toml', '[broken', '无法解析'),
            ('package.json', '{broken', '无法解析'),
            ('package.json', '[]', 'Node.js'),
        ]
        for name, text, expected in cases:
            with self.subTest(name=name, text=text):
                self.assertIn(expected, summarize(Path(name), text, False))
        self.assertIn('来源已截断', summarize(Path('README.md'), '# Overview\nDescription.', True))
        self.assertIn('来源已截断', summarize(Path('AGENTS.md'), 'x' * 3000, False))
