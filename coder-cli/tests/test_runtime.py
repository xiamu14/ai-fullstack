from contextlib import chdir, redirect_stderr, redirect_stdout
from io import StringIO
import json
import os
from pathlib import Path
import shlex
import socket
import subprocess
import sys
import time
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import logfire
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai.usage import RequestUsage, RunUsage

from agent.runtime import create_agent
from integrations.mcp import Config
from agent.conversation import cache_statistics
import asyncio

configure_logfire = logfire.configure


def run_agent(prompt, session="test"):
    async def run():
        conversation = await create_agent(session)
        return await conversation.send(prompt)

    result = asyncio.run(run())
    print(result.output)
    return result


class CoderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        server = Path(__file__).resolve().parents[2] / "mcp_server" / "weather"
        process = subprocess.Popen(
            [str(server / ".venv/bin/python"), str(server / "weather.py"), "--port", str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        cls.addClassCleanup(lambda: (process.terminate(), process.wait(timeout=5)))
        for _ in range(200):
            try:
                with socket.create_connection(("127.0.0.1", port), timeout=0.1):
                    break
            except OSError:
                if process.poll() is not None:
                    raise RuntimeError("天气 HTTP 服务启动失败")
                time.sleep(0.05)
        else:
            raise RuntimeError("天气 HTTP 服务启动超时")
        directory = TemporaryDirectory()
        cls.addClassCleanup(directory.cleanup)
        config = Path(directory.name) / "mcp.json"
        config.write_text(json.dumps({
            "mcpServers": {"weather": {"url": f"http://127.0.0.1:{port}/mcp", "defer_loading": False}},
            "network": {"allowed_origins": [f"http://127.0.0.1:{port}"],
                        "allow_private_origins": [f"http://127.0.0.1:{port}"]},
        }))
        override = patch.dict(os.environ, {"CODER_MCP_CONFIG": str(config)})
        override.start()
        cls.addClassCleanup(override.stop)

    def setUp(self):
        self.exporter = InMemorySpanExporter()
        database = patch("agent.runtime.session_database", side_effect=lambda: Path("workspace/sessions.db").resolve())
        database.start()
        self.addCleanup(database.stop)
        configure = patch(
            "agent.runtime.logfire.configure",
            side_effect=lambda **kwargs: configure_logfire(
                service_name="coder-cli", send_to_logfire=False, console=False,
                additional_span_processors=[SimpleSpanProcessor(self.exporter)],
            ),
        )
        configure.start()
        self.addCleanup(configure.stop)

    def test_runtime_uses_coder_to_create_and_run_project(self):
        responses = iter([
            ToolCallPart("shell", {"command": "mkdir -p hello"}),
            [
                ToolCallPart("write_file", {"path": "hello/pyproject.toml", "content": '[project]\nname = "hello"\nversion = "0.1.0"\n'}),
                ToolCallPart("write_file", {"path": "hello/main.py", "content": 'print("hello world")\n'}),
                ToolCallPart("write_file", {"path": "hello/README.md", "content": "Run python main.py\n"}),
            ],
            ToolCallPart("read_file", {"path": "hello/main.py"}),
            ToolCallPart("shell", {"command": f"{shlex.quote(sys.executable)} hello/main.py"}),
            TextPart("hello world 验证通过"),
        ])
        calls = 0

        def model(messages, info):
            nonlocal calls
            calls += 1
            self.assertTrue({"write_file", "read_file", "shell"} <= {t.name for t in info.function_tools})
            self.assertIn("weather_get_forecast", {t.name for t in info.function_tools})
            part = next(responses)
            if isinstance(part, list):
                self.assertTrue(Path("hello").is_dir())
                return ModelResponse(parts=part)
            if isinstance(part, TextPart):
                outputs = [p.content for m in messages for p in m.parts
                           if isinstance(p, ToolReturnPart) and p.tool_name == "shell"]
                self.assertEqual(len(outputs), 2)
                self.assertIn("hello world", str(outputs[-1]))
            return ModelResponse(parts=[part])

        async def stream_model(messages, info):
            for index, part in enumerate(model(messages, info).parts):
                if isinstance(part, TextPart):
                    yield part.content
                else:
                    yield {index: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

        env = {"OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test-key", "MODEL_NAME": "test"}
        with TemporaryDirectory() as directory, chdir(directory):
            output = StringIO()
            with patch.dict("os.environ", env), patch("agent.runtime.load_dotenv"), \
                 patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(model, stream_function=stream_model)), \
                 redirect_stdout(output):
                run_agent("创建并运行 hello world 项目")
            self.assertEqual(calls, 5)
            self.assertTrue(self.exporter.get_finished_spans(), "应记录 Agent 执行追踪")
            self.assertIn("hello world 验证通过", output.getvalue())
            self.assertEqual(Path("hello/main.py").read_text(), 'print("hello world")\n')
            self.assertTrue(Path("hello/pyproject.toml").is_file())
            self.assertTrue(Path("hello/README.md").is_file())

    def test_cache_statistics_report_reads_separately_from_writes(self):
        result = SimpleNamespace(
            output="验证完成",
            new_messages=lambda: [
                ModelResponse(parts=[TextPart("首次")], usage=RequestUsage(input_tokens=100, cache_write_tokens=80)),
                ModelResponse(parts=[TextPart("后续")], usage=RequestUsage(input_tokens=120, cache_read_tokens=80)),
            ],
            usage=RunUsage(requests=2, input_tokens=220, cache_read_tokens=80, cache_write_tokens=80),
        )
        diagnostics = "\n".join(cache_statistics(result))
        self.assertIn("[cache 请求 1] 输入=100 读取=0 写入=80 缓存输入占比=0.0%", diagnostics)
        self.assertIn("[cache 请求 2] 输入=120 读取=80 写入=0 缓存输入占比=66.7%", diagnostics)
        self.assertIn("[cache 总计] 请求=2 输入=220 读取=80 写入=80 缓存输入占比=36.4%", diagnostics)

    def run_memory_cli(self, prompt, session, replies):
        replies = iter(replies)
        observed = []

        def model(messages, info):
            observed.append(messages[:])
            return ModelResponse(parts=[next(replies)])

        async def stream_model(messages, info):
            part = model(messages, info).parts[0]
            if isinstance(part, TextPart):
                yield part.content
            else:
                yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

        env = {"OPENAI_BASE_URL": "https://example.invalid/v1", "OPENAI_API_KEY": "test-key", "MODEL_NAME": "test"}
        with patch.dict("os.environ", env), patch("agent.runtime.load_dotenv"), \
             patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(model, stream_function=stream_model)), \
             redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            run_agent(prompt, session)
        return observed

    def test_memory_survives_process_restart_and_can_be_updated(self):
        root = Path(__file__).resolve().parents[1]
        with TemporaryDirectory() as directory, chdir(directory):
            self.run_memory_cli("记住端口约定", "first", [
                ToolCallPart("write_memory", {"content": "PORT_PROBE=8001"}),
                TextPart("saved"),
            ])
            note = Path(".agent-memory/main/MEMORY.md")
            self.assertIn("PORT_PROBE=8001", note.read_text())

            # 新进程重建整个 CLI；不传旧历史也应读到磁盘里的笔记。
            probe = '''
import logfire
from unittest.mock import patch
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from agent.runtime import create_agent
from agent.conversation import cache_statistics
from pathlib import Path
from integrations.mcp import Config
from storage import sessions
import asyncio

sessions.SESSION_DATABASE = Path("workspace/sessions.db").resolve()
calls = 0
def model(messages, info):
    global calls
    calls += 1
    if calls == 1:
        assert "PORT_PROBE=8001" in str(messages), "笔记未自动加载"
        return ModelResponse(parts=[ToolCallPart("search_memory", {"query": "PORT_PROBE"})])
    results = [p.content for m in messages for p in m.parts if isinstance(p, ToolReturnPart) and p.tool_name == "search_memory"]
    assert results and "PORT_PROBE=8001" in str(results[-1]), "未搜到笔记"
    return ModelResponse(parts=[TextPart("MEMORY_RESTART_OK")])

async def stream_model(messages, info):
    part = model(messages, info).parts[0]
    if isinstance(part, TextPart):
        yield part.content
    else:
        import json
        yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

configure = logfire.configure
with patch("agent.runtime.load_dotenv"), patch("integrations.mcp.MCPRegistry.read", return_value=Config()), \\
     patch("agent.runtime.logfire.configure", side_effect=lambda **kwargs: configure(send_to_logfire=False, console=False)), \\
     patch("agent.runtime.OpenAIChatModel", return_value=FunctionModel(model, stream_function=stream_model)):
    async def run():
        conversation = await create_agent("second")
        return await conversation.send("读取端口约定")
    result = asyncio.run(run())
    print(result.output)
'''
            result = subprocess.run(
                [sys.executable, "-c", probe],
                env={**os.environ, "PYTHONPATH": str(root), "MODEL_NAME": "test",
                     "OPENAI_API_KEY": "test-key", "OPENAI_BASE_URL": "https://example.invalid/v1"},
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("MEMORY_RESTART_OK", result.stdout)

            self.run_memory_cli("端口改为 8002", "third", [
                ToolCallPart("write_memory", {"old_text": "PORT_PROBE=8001", "content": "PORT_PROBE=8002"}),
                TextPart("updated"),
            ])
            self.assertNotIn("PORT_PROBE=8001", note.read_text())
            self.assertEqual(note.read_text().count("PORT_PROBE=8002"), 1)

    def test_history_search_persists_and_stays_in_its_session(self):
        with TemporaryDirectory() as directory, chdir(directory):
            self.run_memory_cli("HISTORY_PROBE 的原始证据是 EVIDENCE_7319", "original", [TextPart("recorded")])
            self.assertTrue(Path("workspace/sessions.db").is_file())
            for session, should_find in (("original", True), ("unrelated", False)):
                observed = self.run_memory_cli("查找之前的记录", session, [
                    ToolCallPart("search_conversation_history", {"query": "HISTORY_PROBE"}),
                    TextPart("searched"),
                ])
                results = [p.content for m in observed[-1] for p in m.parts
                           if isinstance(p, ToolReturnPart) and p.tool_name == "search_conversation_history"]
                self.assertTrue(results)
                self.assertEqual("EVIDENCE_7319" in str(results[-1]), should_find)


if __name__ == "__main__":
    unittest.main()
