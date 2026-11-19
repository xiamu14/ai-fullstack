import unittest

from pydantic_ai import Agent
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import FunctionModel

from tools.output_hooks import output_hooks


class OutputHookTests(unittest.IsolatedAsyncioTestCase):
    async def test_model_receives_compact_results(self):
        line = "server is waiting for the next request\n"
        tail = "ERROR: missing key\n[exit code: 1]\nOutput: /tmp/output.log"
        payload = ' {\n  "text": "a b \\"c\\"",\n  "value": 1.230e+4\n} '
        html = "<pre>\n  preserve this spacing\n</pre>"

        def shell():
            return line * 5 + tail

        def web_fetch(url: str):
            return payload if url == "json" else html

        calls = iter([
            ToolCallPart("shell", {}),
            ToolCallPart("web_fetch", {"url": "json"}),
            ToolCallPart("web_fetch", {"url": "html"}),
            TextPart("done"),
        ])

        def model(messages, info):
            return ModelResponse(parts=[next(calls)])

        agent = Agent(FunctionModel(model), tools=[shell, web_fetch], capabilities=[output_hooks])
        run = await agent.run("inspect tool output")
        results = [part.content for message in run.all_messages() for part in message.parts
                   if isinstance(part, ToolReturnPart)]
        self.assertEqual(results, [
            line + "[上一行共出现 5 次]\n" + tail,
            '{"text":"a b \\"c\\"","value":1.230e+4}',
            html,
        ])
