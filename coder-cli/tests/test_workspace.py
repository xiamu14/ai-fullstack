from contextlib import chdir
import os
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.capabilities import Capability
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai_harness.step_persistence import RunRecord, SqliteStepStore

from agent_runtime import create_agent
from main import main
from sessions import session_workspace


class WorkspaceTests(unittest.IsolatedAsyncioTestCase):
    async def test_resolves_paths_and_rejects_invalid_directories(self):
        with TemporaryDirectory() as directory, chdir(directory):
            root = Path.cwd()
            project = root / '项目 space'
            project.mkdir()
            database = root / 'state/sessions.db'
            self.assertEqual(await session_workspace(database, None, None), root)
            for path in ('项目 space', str(project)):
                self.assertEqual(await session_workspace(database, None, path), project)
            (root / 'file').touch()
            for path in ('', ' ', 'missing', 'file'):
                with self.subTest(path=path), self.assertRaises(ValueError):
                    await session_workspace(database, None, path)
            self.assertEqual(await session_workspace(database, 'unknown', 'missing'), root)
            self.assertFalse(database.parent.exists())

    async def test_restore_from_other_cwd_keeps_real_file_and_shell_tools_in_saved_workspace(self):
        with TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            project, elsewhere = root / 'project', root / 'elsewhere'
            project.mkdir()
            elsewhere.mkdir()
            database = root / 'state/sessions.db'
            replies = iter([
                ToolCallPart('write_file', {'path': 'proof.txt', 'content': 'workspace proof'}), TextPart('saved'),
                ToolCallPart('read_file', {'path': 'proof.txt'}), ToolCallPart('shell', {'command': 'pwd'}),
                TextPart('restored'),
            ])
            observed = []

            def model(messages, info):
                observed.extend(p.content for m in messages for p in m.parts if isinstance(p, ToolReturnPart))
                return ModelResponse(parts=[next(replies)])

            async def stream_model(messages, info):
                part = model(messages, info).parts[0]
                if isinstance(part, TextPart):
                    yield part.content
                else:
                    yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

            env = {'MODEL_NAME': 'test', 'OPENAI_BASE_URL': 'https://example.invalid/v1', 'OPENAI_API_KEY': 'test-key'}
            with patch.dict(os.environ, env), patch('agent_runtime.load_dotenv'), \
                 patch('agent_runtime.OpenAIChatModel', return_value=FunctionModel(model, stream_function=stream_model)), \
                 patch('agent_runtime.MCP', return_value=Capability()), \
                 patch('agent_runtime.logfire.configure'), patch('agent_runtime.logfire.instrument_pydantic_ai'), \
                 patch('sessions.SESSION_DATABASE', database):
                with chdir(root):
                    first = await create_agent(path='project')
                    self.assertIsNone(first.session_id)
                    await first.send('写入证据')
                self.assertEqual((project / 'proof.txt').read_text(), 'workspace proof')
                self.assertFalse((root / 'proof.txt').exists())
                runs = await SqliteStepStore(database=str(database)).list_runs()
                self.assertEqual(runs[0].metadata['workspace'], str(project))
                for path in (str(elsewhere), 'missing', ''):
                    self.assertEqual(await session_workspace(database, first.session_id, path), project)
                with chdir(elsewhere):
                    resumed = await create_agent(first.session_id)
                    self.assertTrue(resumed.history)
                    await resumed.send('读取证据并确认目录')
                    await create_agent(first.session_id, str(elsewhere))
                    await create_agent(first.session_id, 'missing')
                    await create_agent(first.session_id, '')
                    await create_agent(first.session_id, '../project')
                self.assertIn('workspace proof', str(observed))
                self.assertIn(str(project), str(observed))
                project.rename(root / 'moved')
                with self.assertRaisesRegex(ValueError, '不存在'):
                    await create_agent(first.session_id)

    async def test_legacy_session_uses_old_workspace_and_ignores_child_metadata(self):
        with TemporaryDirectory() as directory:
            database = Path(directory) / 'workspace/sessions.db'
            store = SqliteStepStore(database=str(database))
            await store.register_run(RunRecord(run_id='old', conversation_id='legacy'))
            await store.register_run(RunRecord(
                run_id='child', conversation_id='legacy', parent_run_id='old', metadata={'workspace': '/wrong'},
            ))
            self.assertEqual(await session_workspace(database, 'legacy', None), database.parent.resolve())
            await store.register_run(RunRecord(
                run_id='bad', conversation_id='bad-session', metadata={'workspace': 'relative'},
            ))
            with self.assertRaisesRegex(ValueError, '记录无效'):
                await session_workspace(database, 'bad-session', None)


class WorkspaceCliTests(unittest.TestCase):
    def test_path_is_passed_to_factory_without_changing_process_cwd(self):
        original = Path.cwd()
        with patch('sys.argv', ['main.py', '--path', '../project']), \
             patch('main.sys.stdin.isatty', return_value=True), \
             patch('main.sys.stdout.isatty', return_value=True), \
             patch('main.create_agent') as create, patch('main.ChatShell'):
            main()
        create.assert_awaited_once_with(None, '../project')
        self.assertEqual(Path.cwd(), original)
