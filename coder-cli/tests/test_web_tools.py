import asyncio
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import AsyncMock, patch

import httpx2
from pydantic_ai import Agent, ModelRetry
from pydantic_ai.capabilities import LocalWorkspace, WebFetch
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai_harness.coder import Coder
from tavily.errors import TimeoutError as TavilyTimeout

from tools.web_tools import web_search
from tools.output_hooks import output_hooks


class WebToolsTests(unittest.IsolatedAsyncioTestCase):
    async def test_tavily_sources_and_client_cleanup(self):
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.search.return_value = {"results": [
            {"title": "Source", "url": "https://example.com", "content": "Evidence", "score": 0.9},
        ]}
        with patch.dict(os.environ, {"TAVILY_API_KEY": "secret-test-key"}), patch(
            "tools.web_tools.AsyncTavilyClient", return_value=client,
        ) as factory:
            self.assertEqual(await web_search("query"), [
                {"title": "Source", "url": "https://example.com", "content": "Evidence"},
            ])
        factory.assert_called_once()
        self.assertEqual(factory.call_args.kwargs["api_key"], "secret-test-key")
        self.assertTrue(factory.call_args.kwargs["client"].is_closed)
        client.search.assert_awaited_once_with(
            "query", search_depth="basic", max_results=5,
            include_answer=False, include_raw_content=False, timeout=30,
        )
        client.__aexit__.assert_awaited_once()

    async def test_missing_key_timeout_and_cancellation(self):
        with patch.dict(os.environ, {"TAVILY_API_KEY": ""}):
            with self.assertRaisesRegex(ModelRetry, "TAVILY_API_KEY"):
                await web_search("query")
        client = AsyncMock()
        client.__aenter__.return_value = client
        with patch.dict(os.environ, {"TAVILY_API_KEY": "test-key"}), patch(
            "tools.web_tools.AsyncTavilyClient", return_value=client,
        ):
            client.search.side_effect = TavilyTimeout(30)
            with self.assertRaises(ModelRetry):
                await web_search("query")
            client.search.side_effect = asyncio.CancelledError
            with self.assertRaises(asyncio.CancelledError):
                await web_search("query")

    async def test_native_fetch_with_coder_preserves_structured_result(self):
        def model(messages, info):
            names = {tool.name for tool in info.function_tools}
            self.assertTrue({"web_fetch", "web_search", "read_file", "write_file", "shell"} <= names)
            results = [part for message in messages for part in message.parts
                       if isinstance(part, ToolReturnPart) and part.tool_name == "web_fetch"]
            if results:
                self.assertEqual(results[-1].content["title"], "Tools")
                self.assertIn("Evidence", results[-1].content["content"])
                self.assertNotIn("<h1>", results[-1].content["content"])
                return ModelResponse(parts=[TextPart("done")])
            return ModelResponse(parts=[ToolCallPart("web_fetch", {"url": "https://example.com"})])

        async def stream(messages, info):
            response = model(messages, info)
            for part in response.parts:
                if isinstance(part, ToolCallPart):
                    yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}
                else:
                    yield part.content

        response = httpx2.Response(
            200, text="<html><head><title>Tools</title></head><body><h1>Evidence</h1></body></html>",
            headers={"content-type": "text/html"}, request=httpx2.Request("GET", "https://example.com"),
        )
        with TemporaryDirectory() as directory, patch(
            "pydantic_ai.common_tools.web_fetch.safe_download", AsyncMock(return_value=response),
        ):
            agent = Agent(
                FunctionModel(model, stream_function=stream), tools=[web_search],
                capabilities=[LocalWorkspace(Path(directory)), Coder(), WebFetch(native=False, local=True), output_hooks],
            )
            self.assertEqual((await agent.run("read page")).output, "done")


if __name__ == "__main__":
    unittest.main()
