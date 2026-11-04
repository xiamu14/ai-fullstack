import asyncio
from contextlib import contextmanager
import os
from pathlib import Path
import select
import subprocess
import sys
import threading
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, UserPromptPart
from pydantic_ai.models.function import FunctionModel

from agent.runtime import create_agent
from integrations.mcp import Config
from storage.execution_lock import ExecutionBusyError, execution_lock
from storage.sessions import save_session


PROBE = '''
from pathlib import Path
import sys
from storage.execution_lock import ExecutionBusyError, execution_lock
try:
    with execution_lock(Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])):
        print("READY", flush=True)
        if len(sys.argv) > 4:
            sys.stdin.read()
except ExecutionBusyError:
    print("BUSY", flush=True)
'''


class ProcessLockTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(TemporaryDirectory())).resolve()
        self.database = self.root / "state/sessions.db"
        self.project = self.root / "project"
        self.project.mkdir()
        self.other = self.root / "other"
        self.other.mkdir()

    def probe(self, session, workspace):
        result = subprocess.run([sys.executable, "-c", PROBE, str(self.database), session, str(workspace)],
                                text=True, capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def test_session_mutex_and_independent_workspaces_across_processes(self):
        with execution_lock(self.database, "same", self.project):
            self.assertEqual(self.probe("same", self.other), "BUSY")
            self.assertEqual(self.probe("different", self.other), "READY")
            self.assertEqual(self.probe("different", self.project), "BUSY")
        self.assertEqual(self.probe("same", self.project), "READY")

    def test_overlapping_paths_and_symlinks_share_boundary(self):
        child = self.project / "child"
        child.mkdir()
        alias = self.root / "alias"
        alias.symlink_to(self.project, target_is_directory=True)
        for selected, contender in ((self.project, child), (child, self.project), (alias, self.project)):
            with self.subTest(selected=selected, contender=contender):
                with execution_lock(self.database, "first", selected):
                    self.assertEqual(self.probe("second", contender), "BUSY")
        self.assertEqual(self.probe("second", self.project), "READY")

    def test_failed_partial_acquisition_releases_session_lease(self):
        with execution_lock(self.database, "first", self.project):
            with self.assertRaises(ExecutionBusyError):
                with execution_lock(self.database, "second", self.project):
                    self.fail("overlapping run entered")
            self.assertEqual(self.probe("second", self.other), "READY")

    def test_exception_and_process_death_release_leases(self):
        with self.assertRaises(ValueError):
            with execution_lock(self.database, "same", self.project):
                raise ValueError("probe")
        process = subprocess.Popen(
            [sys.executable, "-c", PROBE, str(self.database), "same", str(self.project), "hold"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        )
        try:
            ready, _, _ = select.select([process.stdout], [], [], 10)
            self.assertTrue(ready, "child never acquired lock")
            self.assertEqual(process.stdout.readline().strip(), "READY")
            self.assertEqual(self.probe("other", self.project), "BUSY")
            process.kill()
            process.wait(timeout=5)
            self.assertEqual(self.probe("same", self.project), "READY")
        finally:
            if process.poll() is None:
                process.kill()
            process.communicate(timeout=5)


class RuntimeLockTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.root = Path(self.enterContext(TemporaryDirectory())).resolve()
        self.project = self.root / "project"
        self.project.mkdir()
        self.other = self.root / "other"
        self.other.mkdir()
        self.database = self.root / "state/sessions.db"

    @contextmanager
    def runtime(self, model):
        env = {"MODEL_NAME": "test", "OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test"}
        with patch.dict(os.environ, env), patch("agent.runtime.load_dotenv"), \
             patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(model)), \
             patch("integrations.mcp.MCPRegistry.read", return_value=Config()), \
             patch("agent.runtime.logfire.configure"), patch("agent.runtime.logfire.instrument_pydantic_ai"), \
             patch("storage.sessions.SESSION_DATABASE", self.database):
            yield

    async def test_concurrent_registration_winner_determines_workspace(self):
        async def concurrent_save(database, session_id, workspace):
            await save_session(database, session_id, self.other)
            await save_session(database, session_id, workspace)
        parts = iter([ToolCallPart("write_file", {"path": "proof.txt", "content": "bound"}), TextPart("done")])
        with self.runtime(lambda m, i: ModelResponse(parts=[next(parts)])):
            with patch("agent.runtime.save_session", side_effect=concurrent_save):
                conversation = await create_agent(path=str(self.project))
            self.assertEqual(conversation.workspace, self.other)
            await conversation.send("write proof")
        self.assertEqual((self.other / "proof.txt").read_text(), "bound")
        self.assertFalse((self.project / "proof.txt").exists())

    async def test_stale_object_reloads_history_under_lock(self):
        observed = []
        def model(messages, info):
            observed.append([p.content for m in messages for p in m.parts if isinstance(p, UserPromptPart) and isinstance(p.content, str)])
            return ModelResponse(parts=[TextPart("done")])
        with self.runtime(model):
            first = await create_agent(path=str(self.project))
            stale = await create_agent(first.session_id)
            await first.send("first")
            await stale.send("second")
            await first.send("third")
        self.assertEqual(observed, [["first"], ["first", "second"], ["first", "second", "third"]])

    async def test_workspace_busy_has_no_request_and_cancel_releases_it(self):
        started, release = asyncio.Event(), asyncio.Event()
        calls = []
        async def model(messages, info):
            prompt = next(p.content for p in reversed(messages[-1].parts) if isinstance(p, UserPromptPart))
            calls.append(prompt)
            if prompt == "hold":
                started.set()
                await release.wait()
            return ModelResponse(parts=[TextPart("done")])
        with self.runtime(model):
            first = await create_agent(path=str(self.project))
            contender = await create_agent(path=str(self.project))
            independent = await create_agent(path=str(self.other))
            task = asyncio.create_task(first.send("hold"))
            try:
                await asyncio.wait_for(started.wait(), 5)
                with self.assertRaises(ExecutionBusyError):
                    await contender.send("must not run")
                await independent.send("independent")
            finally:
                task.cancel()
                with self.assertRaises(asyncio.CancelledError):
                    await task
            await contender.send("after cancel")
        self.assertEqual(calls, ["hold", "independent", "after cancel"])

    async def test_cancel_keeps_workspace_locked_until_file_thread_finishes(self):
        started, release = threading.Event(), threading.Event()
        parts = iter([ToolCallPart("write_file", {"path": "proof.txt", "content": "finished"}), TextPart("done")])
        replace = os.replace
        def delayed_replace(source, target):
            if Path(target).name == "proof.txt":
                started.set()
                if not release.wait(10):
                    raise TimeoutError("test did not release write thread")
            return replace(source, target)
        with self.runtime(lambda m, i: ModelResponse(parts=[next(parts)])):
            first = await create_agent(path=str(self.project))
            second = await create_agent(path=str(self.project))
            with patch("agent.permissions.workspace.os.replace", side_effect=delayed_replace):
                task = asyncio.create_task(first.send("write"))
                try:
                    self.assertTrue(await asyncio.to_thread(started.wait, 5))
                    task.cancel()
                    await asyncio.sleep(0)
                    with self.assertRaises(ExecutionBusyError):
                        await second.send("too early")
                finally:
                    release.set()
                    with self.assertRaises(asyncio.CancelledError):
                        await task
            await second.send("after cleanup")
        self.assertEqual((self.project / "proof.txt").read_text(), "finished")

    async def test_memory_is_shared_by_workspace_but_history_is_not(self):
        observed = []
        def model(messages, info):
            observed.append(str(messages))
            part = ToolCallPart("write_memory", {"content": "SHARED_PROJECT_NOTE_7319"}) if len(observed) == 1 else TextPart("done")
            return ModelResponse(parts=[part])
        with self.runtime(model):
            first = await create_agent(path=str(self.project))
            second = await create_agent(path=str(self.project))
            other = await create_agent(path=str(self.other))
            await first.send("PRIVATE_HISTORY_4521")
            note = self.project / ".agent-memory/main/MEMORY.md"
            self.assertTrue(note.is_file(), "write_memory did not persist the shared note")
            self.assertIn("SHARED_PROJECT_NOTE_7319", note.read_text())
            await second.send("read shared note")
            await other.send("other project")
        self.assertTrue("SHARED_PROJECT_NOTE_7319" in observed[-2], observed[-2][-2000:])
        self.assertNotIn("PRIVATE_HISTORY_4521", observed[-2])
        self.assertNotIn("SHARED_PROJECT_NOTE_7319", observed[-1])
        self.assertNotIn("PRIVATE_HISTORY_4521", observed[-1])
