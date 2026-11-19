import asyncio
import socket
import unittest
from unittest.mock import AsyncMock, patch

import httpx2

from integrations.network import NetworkDenied, NetworkPolicy, PolicyTransport


def answers(*ips):
    return [(socket.AF_INET6 if ":" in ip else socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip, 443)) for ip in ips]


class NetworkTests(unittest.IsolatedAsyncioTestCase):
    async def test_rejects_private_mixed_dns_metadata_and_unlisted_origins(self):
        policy = NetworkPolicy(["https://mcp.example"], [])
        for ips in [("127.0.0.1",), ("8.8.8.8", "10.0.0.1"), ("::ffff:127.0.0.1",), ("168.63.129.16",)]:
            with self.subTest(ips=ips), patch.object(asyncio.get_running_loop(), 'getaddrinfo',
                                                    AsyncMock(return_value=answers(*ips))):
                with self.assertRaises(NetworkDenied):
                    await policy.resolve(httpx2.URL("https://mcp.example/mcp"))
        for url in ("https://mcp.example.evil/mcp", "https://mcp.example:8443/mcp", "http://mcp.example/mcp"):
            with self.assertRaises(NetworkDenied):
                await policy.resolve(httpx2.URL(url))

    async def test_private_exception_does_not_allow_metadata(self):
        policy = NetworkPolicy(["http://localhost:8000"], ["http://localhost:8000"])
        loop = asyncio.get_running_loop()
        with patch.object(loop, 'getaddrinfo', AsyncMock(return_value=answers("127.0.0.1"))):
            self.assertEqual(await policy.resolve(httpx2.URL("http://localhost:8000/mcp")), "127.0.0.1")
        with patch.object(loop, 'getaddrinfo', AsyncMock(return_value=answers("169.254.169.254"))):
            with self.assertRaises(NetworkDenied):
                await policy.resolve(httpx2.URL("http://localhost:8000/mcp"))

    async def test_pins_ip_and_preserves_host_tls_name_and_post(self):
        policy = NetworkPolicy(["https://mcp.example"], [])
        transport = PolicyTransport(policy, 1, "https://mcp.example/mcp")
        seen = []
        async def respond(request):
            seen.append(request)
            self.assertEqual(await request.aread(), b"payload")
            return httpx2.Response(200, content=b"ok")
        await transport.transport.aclose()
        transport.transport = httpx2.MockTransport(respond)
        with patch.object(policy, 'resolve', AsyncMock(return_value="8.8.8.8")):
            async with httpx2.AsyncClient(transport=transport) as client:
                response = await client.post("https://mcp.example/mcp", content=b"payload")
        self.assertEqual(response.content, b"ok")
        self.assertEqual(seen[0].url.host, "8.8.8.8")
        self.assertEqual(seen[0].headers['host'], "mcp.example")
        self.assertEqual(seen[0].extensions['sni_hostname'], "mcp.example")

    async def test_rejects_redirects_cross_origin_and_does_not_replay_post(self):
        policy = NetworkPolicy(["https://mcp.example", "https://other.example"], [])
        transport = PolicyTransport(policy, 1, "https://mcp.example/mcp")
        calls = []
        def redirect(request):
            calls.append(request)
            return httpx2.Response(307, headers={"location": "http://127.0.0.1/admin"})
        await transport.transport.aclose()
        transport.transport = httpx2.MockTransport(redirect)
        with patch.object(policy, 'resolve', AsyncMock(return_value="8.8.8.8")):
            async with httpx2.AsyncClient(transport=transport, follow_redirects=True) as client:
                for url in ("https://mcp.example/mcp", "https://other.example/mcp"):
                    with self.assertRaises(NetworkDenied):
                        await client.post(url, content=b"write")
        self.assertEqual(len(calls), 1)

    async def test_resolution_timeout_and_cancellation_propagate(self):
        policy = NetworkPolicy(["https://mcp.example"], [])
        transport = PolicyTransport(policy, 0, "https://mcp.example")
        async def wait(url):
            await asyncio.Event().wait()
        with patch.object(policy, 'resolve', wait):
            async with httpx2.AsyncClient(transport=transport, timeout=.01) as client:
                with self.assertRaises(TimeoutError):
                    await client.get("https://mcp.example")
                task = asyncio.create_task(client.get("https://mcp.example"))
                await asyncio.sleep(0)
                task.cancel()
                with self.assertRaises(asyncio.CancelledError):
                    await task

    async def test_tls_verifies_original_hostname_on_pinned_connection(self):
        import ssl
        import subprocess
        from pathlib import Path
        from tempfile import TemporaryDirectory
        with TemporaryDirectory() as directory:
            cert, key = Path(directory) / 'cert.pem', Path(directory) / 'key.pem'
            subprocess.run([
                'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
                '-keyout', str(key), '-out', str(cert), '-subj', '/CN=mcp.example',
                '-addext', 'subjectAltName=DNS:mcp.example',
            ], check=True, capture_output=True)
            server_tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            server_tls.load_cert_chain(cert, key)
            names = []
            server_tls.set_servername_callback(lambda sock, name, ctx: names.append(name))
            async def respond(reader, writer):
                await reader.readuntil(b'\r\n\r\n')
                writer.write(b'HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok')
                await writer.drain()
                writer.close()
                await writer.wait_closed()
            server = await asyncio.start_server(respond, '127.0.0.1', 0, ssl=server_tls)
            async with server:
                port = server.sockets[0].getsockname()[1]
                endpoint = f'https://mcp.example:{port}'
                policy = NetworkPolicy([endpoint], [endpoint])
                transport = PolicyTransport(policy, 0, endpoint)
                await transport.transport.aclose()
                transport.transport = httpx2.AsyncHTTPTransport(verify=ssl.create_default_context(cafile=str(cert)))
                with patch.object(policy, 'resolve', AsyncMock(return_value='127.0.0.1')):
                    async with httpx2.AsyncClient(transport=transport) as client:
                        self.assertEqual((await client.get(endpoint)).text, 'ok')
                self.assertEqual(names, ['mcp.example'])

    async def test_read_timeout_is_not_retried(self):
        policy = NetworkPolicy(['https://mcp.example'], [])
        transport = PolicyTransport(policy, 2, 'https://mcp.example')
        calls = []
        def fail(request):
            calls.append(request)
            raise httpx2.ReadTimeout('already sent')
        await transport.transport.aclose()
        transport.transport = httpx2.MockTransport(fail)
        with patch.object(policy, 'resolve', AsyncMock(return_value='8.8.8.8')):
            async with httpx2.AsyncClient(transport=transport) as client:
                with self.assertRaises(httpx2.ReadTimeout):
                    await client.post('https://mcp.example', content=b'write')
        self.assertEqual(len(calls), 1)
