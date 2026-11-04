import asyncio
import json
import os
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

import httpx2
from pydantic_ai import Agent
from pydantic_ai.messages import FunctionToolCallEvent
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from agent.conversation import Conversation
from integrations.mcp import MCPConfigError, MCPRegistry


SERVER = '''import asyncio,json,os,sys
from pathlib import Path
from mcp.server import MCPServer
Path("pid").write_text(str(os.getpid()))
print("stdio-server-stderr", file=sys.stderr)
mcp = MCPServer("local-test")
@mcp.tool()
def echo(text: str) -> dict:
    """Echo text and process configuration for verification."""
    return {"text":text,"cwd":os.getcwd(),"value":os.getenv("GREETING"),
            "parent_secret_inherited":"MCP_PARENT_ONLY" in os.environ,"arg":sys.argv[1]}
@mcp.tool()
async def slow() -> str:
    """Wait until cancelled."""
    await asyncio.Event().wait()
    return "unreachable"
mcp.run(transport="stdio")
'''


def configuration(root, *, deferred=True):
    project = root / 'project'
    project.mkdir()
    (project / 'server.py').write_text(SERVER)
    config_dir = root / 'config'
    config_dir.mkdir()
    path = config_dir / 'mcp.json'
    path.write_text(json.dumps({'mcpServers': {'local': {
        'command': sys.executable, 'args': ['server.py', 'literal $(not-executed)'],
        'cwd': '../project', 'env': {'GREETING': '${MCP_GREETING}'},
        'allowed_tools': ['echo', 'slow'], 'defer_loading': deferred,
    }}}))
    return path, project


class StdioTests(unittest.IsolatedAsyncioTestCase):
    def assert_stopped(self, project):
        pid = int((project / 'pid').read_text())
        with self.assertRaises(ProcessLookupError):
            os.kill(pid, 0)

    async def test_real_stdio_discovery_env_args_cwd_and_process_teardown(self):
        with TemporaryDirectory() as directory:
            path, project = configuration(Path(directory))
            requests = []
            def respond(request):
                payload = json.loads(request.content)
                requests.append(payload)
                names = {t['function']['name'] for t in payload.get('tools', [])}
                index = len(requests)
                if index == 1:
                    self.assertEqual(names, {'search_tools'})
                    call = ('search_tools', {'queries': ['echo']})
                elif index == 2:
                    self.assertIn('local_echo', names)
                    call = ('local_echo', {'text': 'hello'})
                else:
                    result = json.loads(payload['messages'][-1]['content'])
                    self.assertEqual(result['text'], 'hello')
                    self.assertEqual(result['value'], 'configured')
                    self.assertEqual(Path(result['cwd']), project.resolve())
                    self.assertEqual(result['arg'], 'literal $(not-executed)')
                    self.assertFalse(result['parent_secret_inherited'])
                    call = None
                message = {'role': 'assistant', 'content': 'Done'}
                if call:
                    message = {'role': 'assistant', 'content': None, 'tool_calls': [{
                        'id': f'call-{index}', 'type': 'function',
                        'function': {'name': call[0], 'arguments': json.dumps(call[1])},
                    }]}
                return httpx2.Response(200, json={
                    'id': 'test', 'object': 'chat.completion', 'created': 0, 'model': 'test',
                    'choices': [{'index': 0, 'message': message, 'finish_reason': 'tool_calls' if call else 'stop'}],
                })
            with patch.dict(os.environ, {'MCP_GREETING': 'configured', 'MCP_PARENT_ONLY': 'do-not-inherit'}):
                async with httpx2.AsyncClient(transport=httpx2.MockTransport(respond)) as client:
                    model = OpenAIChatModel('test', provider=OpenAIProvider(
                        base_url='https://example.invalid/v1', api_key='test', http_client=client,
                    ))
                    result = await Conversation(Agent(model), mcp=MCPRegistry(path)).send('Echo hello')
            self.assertEqual(result.output, 'Done')
            self.assertEqual(len(requests), 3)
            self.assert_stopped(project)

    async def test_cancel_closes_stdio_process_and_preserves_history(self):
        with TemporaryDirectory() as directory:
            path, project = configuration(Path(directory), deferred=False)
            started = asyncio.Event()
            async def model(messages, info):
                yield {0: DeltaToolCall(name='local_slow', json_args='{}')}
            async def on_tool(event):
                if isinstance(event, FunctionToolCallEvent):
                    started.set()
            conversation = Conversation(Agent(FunctionModel(stream_function=model)), mcp=MCPRegistry(path))
            with patch.dict(os.environ, {'MCP_GREETING': 'configured'}):
                task = asyncio.create_task(conversation.send('Wait', on_tool=on_tool))
                try:
                    await asyncio.wait_for(started.wait(), 5)
                finally:
                    task.cancel()
                    with self.assertRaises(asyncio.CancelledError):
                        await task
            self.assertEqual(conversation.history, [])
            self.assert_stopped(project)

    async def test_configuration_rejects_mixed_transports_and_missing_env(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'mcp.json'
            for server in ({}, {'command': 'python', 'url': 'https://example.com'},
                           {'url': 'https://example.com', 'args': ['server.py']},
                           {'command': 'python', 'headers': {'Authorization': 'secret'}}):
                path.write_text(json.dumps({'mcpServers': {'local': server}}))
                with self.assertRaises(MCPConfigError) as error:
                    MCPRegistry(path).read()
                self.assertNotIn('secret', str(error.exception))
            path, _ = configuration(Path(directory))
            with patch.dict(os.environ, {}, clear=True):
                with self.assertRaises(MCPConfigError):
                    await Conversation(Agent('test'), mcp=MCPRegistry(path)).send('Test')

    async def test_removal_stops_process_before_next_model_request(self):
        from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart
        with TemporaryDirectory() as directory:
            path, project = configuration(Path(directory), deferred=False)
            calls = 0
            def unregister() -> str:
                path.write_text('{}')
                return 'Removed'
            def model(messages, info):
                nonlocal calls
                calls += 1
                names = {tool.name for tool in info.function_tools}
                if calls == 1:
                    self.assertIn('local_echo', names)
                    return ModelResponse(parts=[ToolCallPart('unregister', {})])
                self.assertNotIn('local_echo', names)
                self.assert_stopped(project)
                return ModelResponse(parts=[TextPart('Done')])
            with patch.dict(os.environ, {'MCP_GREETING': 'configured'}):
                result = await Conversation(Agent(FunctionModel(model), tools=[unregister]), mcp=MCPRegistry(path)).send('Remove')
            self.assertEqual(result.output, 'Done')
            self.assertEqual(calls, 2)

    async def test_missing_command_fails_without_calling_model(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'mcp.json'
            path.write_text(json.dumps({'mcpServers': {'bad': {'command': str(Path(directory) / 'not-found')}}}))
            agent = Agent(FunctionModel(lambda messages, info: self.fail('must fail before the model request')))
            with self.assertRaises(OSError):
                await Conversation(agent, mcp=MCPRegistry(path)).send('Test')

    async def test_connection_wrapper_preserves_programming_errors(self):
        from unittest.mock import AsyncMock
        from pydantic_ai.mcp import MCPToolset
        from integrations.mcp import MCPConnection
        error = RuntimeError('programming error')
        error.__cause__ = ValueError('invalid internal state')
        connection = MCPConnection('https://example.invalid/mcp')
        with patch.object(MCPToolset, '__aenter__', AsyncMock(side_effect=error)):
            with self.assertRaises(RuntimeError) as caught:
                await connection.__aenter__()
        self.assertIs(caught.exception, error)
