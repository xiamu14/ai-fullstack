import asyncio
from pathlib import Path
import socket
import subprocess
import sys
import unittest
from unittest.mock import patch

import httpx
from mcp.client import Client
from mcp.client.stdio import StdioServerParameters

import weather


class WeatherTests(unittest.IsolatedAsyncioTestCase):
    async def test_tools_and_upstream_errors(self):
        paths = []

        def respond(request):
            paths.append(request.url.path)
            if request.url.path == "/alerts/active/area/CA":
                return httpx.Response(200, json={"features": []})
            if request.url.path.startswith("/points/"):
                return httpx.Response(200, json={"properties": {"forecast": f"{weather.API}/forecast"}})
            if request.url.path == "/forecast":
                return httpx.Response(200, json={"properties": {"periods": [{"name": str(i)} for i in range(8)]}})
            return httpx.Response(503)

        client_class = httpx.AsyncClient
        with patch("weather.httpx.AsyncClient", side_effect=lambda **kwargs: client_class(
            transport=httpx.MockTransport(respond), **kwargs
        )):
            async with Client(weather.mcp) as client:
                alerts = await client.call_tool("get_alerts", {"state": "ca"})
                self.assertEqual(alerts.structured_content, {"alerts": []})
                forecast = await client.call_tool("get_forecast", {"latitude": 42.36, "longitude": -71.06})
                self.assertEqual(len(forecast.structured_content["periods"]), 5)
                self.assertEqual(paths[-2:], ["/points/42.36,-71.06", "/forecast"])
                failure = await client.call_tool("get_alerts", {"state": "NY"})
                self.assertTrue(failure.is_error)
                self.assertIn("503", failure.content[0].text)

    async def check_transport(self, transport):
        async with Client(transport) as client:
            tools = await client.list_tools()
            self.assertEqual({tool.name for tool in tools.tools}, {"get_alerts", "get_forecast"})
            invalid = await client.call_tool("get_forecast", {"latitude": 91, "longitude": 0})
            self.assertTrue(invalid.is_error)

    async def test_stdio(self):
        await self.check_transport(StdioServerParameters(
            command=sys.executable, args=["-c", "from weather import mcp; mcp.run(transport='stdio')"],
            cwd=Path(weather.__file__).resolve().parent,
        ))

    async def test_http(self):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        process = subprocess.Popen(
            [sys.executable, str(Path(weather.__file__).resolve()), "--port", str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        try:
            for _ in range(200):
                if process.poll() is not None:
                    self.fail("HTTP 服务提前退出")
                try:
                    _, writer = await asyncio.open_connection("127.0.0.1", port)
                    writer.close()
                    await writer.wait_closed()
                    break
                except OSError:
                    await asyncio.sleep(0.05)
            else:
                self.fail("HTTP 服务启动超时")
            await self.check_transport(f"http://127.0.0.1:{port}/mcp")
        finally:
            process.terminate()
            process.wait(timeout=5)


if __name__ == "__main__":
    unittest.main()
