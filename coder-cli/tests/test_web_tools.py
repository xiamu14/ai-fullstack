import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

import httpx
from pydantic_ai import Agent, ModelRetry
from pydantic_ai.capabilities import Capability, LocalWorkspace
from pydantic_ai.messages import ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai_harness.coder import Coder

from tools.web_tools import web_fetch


class WebToolsTests(unittest.IsolatedAsyncioTestCase):
    def client_mock(self, handler):
        client_class = httpx.AsyncClient
        return patch("tools.web_tools.httpx.AsyncClient", side_effect=lambda **kwargs: client_class(
            transport=httpx.MockTransport(handler), **kwargs
        ))

    async def test_fetch_redirect_and_failures(self):
        def handler(request):
            if request.url.path == "/redirect":
                return httpx.Response(302, headers={"location": "/page"})
            if request.url.path == "/missing":
                return httpx.Response(404)
            if request.url.path == "/timeout":
                raise httpx.ReadTimeout("读取超时", request=request)
            return httpx.Response(200, text="<h1>工具课程</h1>")

        with self.client_mock(handler):
            self.assertEqual(await web_fetch("https://example.com/redirect"), "<h1>工具课程</h1>")
            for url in ("file:///tmp/a", "https://example.com/missing", "https://example.com/timeout"):
                with self.subTest(url=url), self.assertRaises(ModelRetry):
                    await web_fetch(url)

    async def test_direct_and_capability_registration_with_coder(self):
        async def stream_model(messages, info):
            names = {tool.name for tool in info.function_tools}
            self.assertTrue({"web_fetch", "read_file", "write_file", "shell"} <= names)
            results = [part for message in messages for part in message.parts
                       if isinstance(part, ToolReturnPart) and part.tool_name == "web_fetch"]
            if results:
                self.assertEqual(results[-1].content, "<h1>工具课程</h1>")
                yield "工具课程"
            else:
                yield {0: DeltaToolCall(name="web_fetch", json_args=json.dumps({"url": "https://example.com"}))}

        with TemporaryDirectory() as directory, self.client_mock(
            lambda request: httpx.Response(200, text="<h1>工具课程</h1>")
        ):
            for bundled in (False, True):
                with self.subTest(bundled=bundled):
                    capabilities = [LocalWorkspace(Path(directory)), Coder()]
                    if bundled:
                        capabilities.append(Capability(tools=[web_fetch], instructions="需要网页内容时调用 web_fetch。"))
                    agent = Agent(
                        FunctionModel(stream_function=stream_model),
                        capabilities=capabilities,
                        tools=[] if bundled else [web_fetch],
                    )
                    result = await agent.run("获取网页标题")
                    self.assertEqual(result.output, "工具课程")


if __name__ == "__main__":
    unittest.main()
