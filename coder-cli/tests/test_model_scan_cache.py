import json
import os
import unittest
from unittest.mock import AsyncMock, patch

import httpx
import httpx2

from integrations import network_privacy
from integrations.model_data import check_model_payload
from integrations.model_http import ModelTransport
from integrations.network import NetworkDenied
from integrations.network_data import check_data


def payload(messages, **extra):
    return json.dumps({"model": "test-model", "messages": messages, **extra}).encode()


def message(text):
    return {"role": "user", "content": text}


class ModelScanCacheTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        network_privacy._SCANNED.clear()

    def test_unchanged_history_reuses_evidence_and_only_new_message_is_scanned(self):
        old = [message("first public message"), message("second public message")]
        with patch.object(network_privacy, "_scan_content", wraps=network_privacy._scan_content) as scan:
            check_model_payload(payload(old))
            before = scan.call_count
            check_model_payload(payload(old))
            self.assertEqual(scan.call_count, before)
            check_model_payload(payload([*old, message("continue")]))
            self.assertEqual(scan.call_count, before + 1)
            reordered_keys = [{"content": item["content"], "role": item["role"]} for item in old]
            check_model_payload(payload(reordered_keys))
            self.assertEqual(scan.call_count, before + 1)

    def test_native_messages_and_instructions_use_the_same_incremental_scanner(self):
        from pydantic_ai.messages import ModelMessagesTypeAdapter, ModelRequest, ModelResponse, TextPart, UserPromptPart
        old = ModelRequest(parts=[UserPromptPart("original user message")])
        with patch.object(network_privacy, "_scan_content", wraps=network_privacy._scan_content) as scan:
            check_model_payload(ModelMessagesTypeAdapter.dump_json([old], exclude_none=True))
            before = scan.call_count
            check_model_payload(ModelMessagesTypeAdapter.dump_json([
                old, ModelResponse(parts=[TextPart("previous answer")]), ModelRequest(parts=[UserPromptPart("continue")]),
            ], exclude_none=True))
            self.assertEqual(scan.call_count, before + 2)
            check_model_payload(json.dumps(["fixed system instructions"]).encode())
            before = scan.call_count
            check_model_payload(json.dumps(["fixed system instructions", "new instructions"]).encode())
            self.assertEqual(scan.call_count, before + 1)

    def test_mutations_and_uncached_extra_fields_are_checked(self):
        original = message("public")
        check_model_payload(payload([original]))
        original["content"] = "password=hidden"
        with self.assertRaises(NetworkDenied):
            check_model_payload(payload([original]))
        with self.assertRaises(NetworkDenied):
            check_model_payload(payload([message("public")], metadata={"api_key": "hidden"}))
        for raw in (b'{"messages":[],"messages":[{"content":"public"}]}',
                    b'{"messages":[{"content":"private", "content":"public"}]}',
                    b'{"temperature":NaN}', b'{"temperature":1e999}', b'not-json',
                    b'{"messages":["\\ud800"]}', '{"messages":[]}'.encode("utf-16")):
            with self.subTest(raw=raw), self.assertRaises(NetworkDenied):
                check_model_payload(raw)

    def test_rule_and_credential_changes_invalidate_cache(self):
        body = payload([message("public marker ABCDEFG123456789")])
        with patch.object(network_privacy, "_scan_content", wraps=network_privacy._scan_content) as scan:
            check_model_payload(body)
            before = scan.call_count
            with patch.object(network_privacy, "SCANNER_VERSION", "changed"):
                check_model_payload(body)
            self.assertGreater(scan.call_count, before)
            with patch.dict(os.environ, {"NEW_API_KEY": "ABCDEFG123456789"}):
                with self.assertRaises(NetworkDenied):
                    check_model_payload(body)

    def test_cache_is_bounded_and_does_not_grant_category_or_binary_permissions(self):
        with patch.object(network_privacy, "MAX_SCANNED", 3):
            for number in range(8):
                check_model_payload(payload([message(f"public {number}")]))
            self.assertLessEqual(len(network_privacy._SCANNED), 3)
        from integrations.network_data import ALLOWED_DATA
        body = payload([message("public")])
        check_model_payload(body)
        with patch.dict(ALLOWED_DATA, {"model": frozenset()}):
            with self.assertRaises(NetworkDenied):
                check_model_payload(body)
        binary = b'[{"kind":"binary","data":"public"}]'
        check_data(binary, destination="http", category="public")
        with self.assertRaises(NetworkDenied):
            check_model_payload(binary)

    async def test_sdk_rechecks_actual_mutated_payload_and_destination_after_cache_hit(self):
        transport = ModelTransport("https://example.com/v1")
        sent = []
        async def receive(request):
            sent.append(await request.aread())
            return httpx2.Response(200, stream=httpx2.ByteStream(b"ok"))
        with patch.object(transport.transport.policy, "resolve", AsyncMock(return_value="93.184.216.34")) as resolve, \
             patch.object(transport.transport.transport, "handle_async_request", side_effect=receive), \
             patch.object(network_privacy, "_scan_content", wraps=network_privacy._scan_content) as scan:
            async with httpx.AsyncClient(transport=transport) as client:
                old = message("stable history marker")
                first = payload([old])
                await client.post("https://example.com/v1/chat/completions", content=first)
                second = payload([old, message("continue")])
                await client.post("https://example.com/v1/chat/completions", content=second)
                self.assertEqual(sum(b"stable history marker" in call.args[0] for call in scan.call_args_list), 1)
                with self.assertRaises(NetworkDenied):
                    await client.post("https://example.com/v1/chat/completions", content=payload([message("password=hidden")]))
                with self.assertRaises(NetworkDenied):
                    await client.post("https://other.example/v1/chat/completions", content=second)
        self.assertEqual(sent, [first, second])
        self.assertEqual(resolve.await_count, 2)
