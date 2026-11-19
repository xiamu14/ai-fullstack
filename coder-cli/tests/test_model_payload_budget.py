import json
import unittest
from unittest.mock import AsyncMock, patch

import httpx
import httpx2

from integrations.model_http import ModelTransport
from integrations.network import NetworkDenied
from integrations.network_data import check_data, payload_limit
from integrations.network_privacy import MAX_PAYLOAD


class ModelPayloadTests(unittest.IsolatedAsyncioTestCase):
    def test_model_budget_does_not_expand_other_network_operations(self):
        payload = json.dumps({"content": "ordinary " * 140_000}).encode()
        self.assertGreater(len(payload), MAX_PAYLOAD)
        check_data(payload, destination="model", category="conversation")
        for destination, category in (("http", "public"), ("search", "public"), ("mcp", "project")):
            with self.subTest(destination=destination), self.assertRaises(NetworkDenied):
                check_data(payload, destination=destination, category=category)

    async def test_actual_transport_checks_secret_after_first_megabyte(self):
        transport = ModelTransport("https://example.com/v1")
        sent = []

        async def receive(request):
            sent.append(await request.aread())
            return httpx2.Response(200, stream=httpx2.ByteStream(b"ok"))

        with patch.object(transport.transport.policy, "resolve", AsyncMock(return_value="93.184.216.34")) as resolve, \
             patch.object(transport.transport.transport, "handle_async_request", side_effect=receive):
            async with httpx.AsyncClient(transport=transport) as client:
                text = "ordinary " * 140_000
                payload = {"messages": [{"role": "user", "content": text}]}
                response = await client.post("https://example.com/v1/chat/completions", json=payload)
                self.assertEqual(response.text, "ok")
                self.assertEqual(json.loads(sent[0]), payload)
                self.assertGreater(len(sent[0]), MAX_PAYLOAD)
                with self.assertRaises(NetworkDenied):
                    await client.post("https://example.com/v1/chat/completions",
                                      json={"messages": [{"role": "user", "content": text + " password=hidden"}]})
                with self.assertRaises(NetworkDenied):
                    await client.post("https://example.com/v1/chat/completions",
                                      content=b"x" * (payload_limit("model") + 1))
        self.assertEqual(len(sent), 1)
        self.assertEqual(resolve.await_count, 1)
