import asyncio
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

import httpx2
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from agent.runtime import create_agent


class MCPSkillTests(unittest.IsolatedAsyncioTestCase):
    async def test_skill_file_configuration_and_same_run_mcp_discovery(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            workspace = root / 'unrelated-project'
            workspace.mkdir()
            config = root / 'custom mcp.json'
            config.write_text(json.dumps({
                'mcpServers': {'existing': {'url': 'https://existing.example/mcp', 'enabled': False}},
                'network': {'allowed_origins': ['https://existing.example'], 'read_timeout': 25},
            }))
            with socket.socket() as sock:
                sock.bind(('127.0.0.1', 0))
                port = sock.getsockname()[1]
            code = '''from mcp.server import MCPServer
mcp = MCPServer("skill-test")
@mcp.tool()
def echo(text: str) -> str:
    """Echo text for verification."""
    return "ECHO:" + text
mcp.run(transport="streamable-http", host="127.0.0.1", port=''' + str(port) + ')'
            process = subprocess.Popen([sys.executable, '-c', code], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for _ in range(100):
                    try:
                        _, writer = await asyncio.open_connection('127.0.0.1', port)
                        writer.close()
                        await writer.wait_closed()
                        break
                    except OSError:
                        if process.poll() is not None:
                            self.fail('test MCP exited')
                        await asyncio.sleep(.02)
                else:
                    self.fail('test MCP did not start')
                endpoint = f'http://127.0.0.1:{port}'
                requests = []
                def respond(request):
                    payload = json.loads(request.content)
                    requests.append(payload)
                    text, index = json.dumps(payload, ensure_ascii=False), len(requests)
                    names = {t['function']['name'] for t in payload.get('tools', [])}
                    if index == 1:
                        self.assertIn('mcp_config_path', text)
                        self.assertIn(str(config), text)
                        self.assertIn('mcp-config', text)
                        self.assertNotIn('## 合并与验证', text)
                        call = ('load_capability', {'id': 'mcp-config'})
                    elif index == 2:
                        self.assertIn('## 授权与等待', text)
                        call = ('ask_user_question', {'questions': [{
                            'header': '授权', 'question': '请完成授权后反馈。', 'multiSelect': False,
                            'options': [{'label': '已授权'}, {'label': '取消'}],
                        }]})
                    elif index == 3:
                        self.assertIn('已授权', text)
                        self.assertIn('os.replace', text)
                        data = json.loads(config.read_text())
                        data['mcpServers']['demo'] = {'url': endpoint + '/mcp', 'allowed_tools': ['echo']}
                        for key in ('allowed_origins', 'allow_private_origins'):
                            data['network'].setdefault(key, []).append(endpoint)
                        call = ('write_file', {'path': str(config), 'content': json.dumps(data)})
                    elif index == 4:
                        self.assertIn('search_tools', names, str(payload.get('messages'))[-2500:])
                        self.assertNotIn('demo_echo', names)
                        call = ('search_tools', {'queries': ['echo']})
                    elif index == 5:
                        self.assertIn('demo_echo', names)
                        call = ('demo_echo', {'text': 'verified'})
                    else:
                        self.assertIn('ECHO:verified', text)
                        call = None
                    message = {'role': 'assistant', 'content': 'Configured'}
                    if call:
                        message = {'role': 'assistant', 'content': None, 'tool_calls': [{
                            'id': f'call-{index}', 'type': 'function',
                            'function': {'name': call[0], 'arguments': json.dumps(call[1])},
                        }]}
                    if payload.get('stream'):
                        delta = dict(message)
                        if call:
                            delta['tool_calls'][0]['index'] = 0
                        chunks = []
                        for change, finish in [(delta, None), ({}, 'tool_calls' if call else 'stop')]:
                            chunks.append('data: ' + json.dumps({
                                'id': 'test', 'object': 'chat.completion.chunk', 'created': 0, 'model': 'test',
                                'choices': [{'index': 0, 'delta': change, 'finish_reason': finish}],
                            }) + '\n\n')
                        return httpx2.Response(200, headers={'content-type': 'text/event-stream'},
                                               text=''.join(chunks) + 'data: [DONE]\n\n')
                    return httpx2.Response(200, json={
                        'id': 'test', 'object': 'chat.completion', 'created': 0, 'model': 'test',
                        'choices': [{'index': 0, 'message': message, 'finish_reason': 'tool_calls' if call else 'stop'}],
                    })
                env = {'MODEL_NAME': 'test', 'OPENAI_BASE_URL': 'https://example.invalid/v1',
                       'OPENAI_API_KEY': 'test', 'CODER_MCP_CONFIG': str(config)}
                async with httpx2.AsyncClient(transport=httpx2.MockTransport(respond)) as client:
                    model = OpenAIChatModel('test', provider=OpenAIProvider(
                        base_url='https://example.invalid/v1', api_key='test', http_client=client,
                    ))
                    with patch.dict(os.environ, env), patch('agent.runtime.load_dotenv'), \
                         patch('agent.runtime.OpenAIChatModel', return_value=model), \
                         patch('agent.runtime.logfire.configure'), patch('agent.runtime.logfire.instrument_pydantic_ai'), \
                         patch('storage.sessions.SESSION_DATABASE', root / 'state/sessions.db'):
                        conversation = await create_agent(path=str(workspace))
                        async def answer(question):
                            if '工具审批' in question:
                                self.assertTrue(conversation.feedback('本次允许'))
                            else:
                                self.assertIn('请完成授权后反馈', question)
                                self.assertTrue(conversation.feedback('已授权'))
                        result = await conversation.send('配置并验证 demo MCP，允许调用 echo。', on_question=answer)
                self.assertEqual(result.output, 'Configured')
                self.assertEqual(len(requests), 6)
                data = json.loads(config.read_text())
                self.assertIn('existing', data['mcpServers'])
                self.assertEqual(data['network']['read_timeout'], 25)
                self.assertIn('https://existing.example', data['network']['allowed_origins'])
            finally:
                process.terminate()
                process.wait(timeout=5)
