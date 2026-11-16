import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import Event, ReadableSpan
from opentelemetry.sdk.trace.export import SpanExportResult
from opentelemetry.trace import SpanContext, Status, StatusCode

from integrations.telemetry import UsageExporter, project_span


class TelemetryTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_allowlisted_numeric_metrics_leave_process(self):
        private = "private-canary-content"
        span = ReadableSpan(
            name=private, context=SpanContext(1, 2, False), start_time=1, end_time=2,
            attributes={"gen_ai.usage.input_tokens": 12, "gen_ai.usage.output_tokens": private,
                        "command": private, "gen_ai.input.messages": private},
            resource=Resource({"host.name": private}),
            events=[Event(private, {"exception.message": private})],
            status=Status(StatusCode.ERROR, private),
        )
        projected = project_span(span)
        self.assertEqual(projected.attributes, {"gen_ai.usage.input_tokens": 12})
        self.assertFalse(projected.events)
        self.assertIsNone(projected.status.description)
        exporter = UsageExporter("test-key", "https://example.com/v1/traces")
        with patch.object(exporter, "send", new_callable=AsyncMock) as send:
            result = await asyncio.to_thread(exporter.export, [span])
        self.assertEqual(result, SpanExportResult.SUCCESS)
        payload = send.call_args.args[0]
        self.assertNotIn(private.encode(), payload)
        self.assertIn(b"gen_ai.usage.input_tokens", payload)
