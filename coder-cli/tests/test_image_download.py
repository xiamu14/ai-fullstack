import base64
import json
import importlib.util
import shlex
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
import unittest

from pydantic_ai import Agent, UsageLimits
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai.messages import ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai_harness import Skills
from pydantic_ai_harness.coder import Coder

SKILLS = Path(__file__).resolve().parents[1] / "skills"
SCRIPT = SKILLS / "web-download/scripts/download.py"
spec = importlib.util.spec_from_file_location("download_script", SCRIPT)
download_script = importlib.util.module_from_spec(spec)
spec.loader.exec_module(download_script)


PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=")


class PageHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        image = self.path == "/image.png"
        self.send_response(200)
        self.send_header("Content-Type", "image/png" if image else "text/html")
        self.end_headers()
        self.wfile.write(PNG if image else b'''<script>
            setTimeout(() => {
                const img = document.createElement('img');
                img.alt = 'This contains: Futuristic Model';
                img.src = '/image.png';
                img.style.display = 'none';
                document.body.append(img);
                document.body.append(img.cloneNode());
            }, 50);
        </script>''')

    def log_message(self, *args):
        pass


class ImageDownloadTests(unittest.IsolatedAsyncioTestCase):
    async def test_load_skill_and_run_download_script(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), PageHandler)
        Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        url = f"http://127.0.0.1:{server.server_port}/"
        calls = 0

        async def stream(messages, info):
            nonlocal calls
            calls += 1
            self.assertNotIn("download_image", {tool.name for tool in info.function_tools})
            returns = [p for m in messages for p in m.parts if isinstance(p, ToolReturnPart)]
            if calls == 1:
                yield {0: DeltaToolCall(name="load_capability", json_args=json.dumps({"id": "web-download"}))}
            elif calls == 2:
                self.assertIn("scripts/download.py", str(messages))
                command = shlex.join([
                    "uv", "run", "--locked", "--project", str(SKILLS.parent), "python", str(SCRIPT), url,
                    'img[alt="This contains: Futuristic Model"]', '--workspace', '.',
                ])
                yield {0: DeltaToolCall(name="shell", json_args=json.dumps({"command": command}))}
            else:
                self.assertIn('"status": "saved"', str(returns[-1].content))
                yield "已保存"

        with TemporaryDirectory() as directory:
            agent = Agent(FunctionModel(stream_function=stream), capabilities=[
                LocalWorkspace(Path(directory)), Coder(), Skills(str(SKILLS))
            ])
            result = await agent.run("下载图片到 outputs", usage_limits=UsageLimits(request_limit=3, tool_calls_limit=2))
            self.assertEqual(result.output, "已保存")
            self.assertEqual(result.usage.requests, 3)
            self.assertEqual(result.usage.tool_calls, 2)
            files = list(Path(directory).glob("outputs/*.png"))
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0].read_bytes(), PNG)

    async def test_invalid_input_returns_failure(self):
        for url, output_dir in (("file:///tmp/a", "outputs"), ("https://example.com", "../outside")):
            with self.subTest(url=url), TemporaryDirectory() as directory:
                result = await download_script.download_image(Path(directory), url, "img", output_dir)
                self.assertEqual(result["status"], "failed")
