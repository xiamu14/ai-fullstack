"""HTTP server wiring: BaseHTTPRequestHandler dispatching through a Router."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from .core import HTTPError, Request, Response
from .router import Router

__all__ = ["make_server", "serve"]


class _Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "mini_http/0.1.0"

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def do_PATCH(self) -> None:
        self._dispatch("PATCH")

    def do_PUT(self) -> None:
        self._dispatch("PUT")

    def do_DELETE(self) -> None:
        self._dispatch("DELETE")

    def _dispatch(self, method: str) -> None:
        try:
            request = self._build_request(method)
            handler, params = self.server.router.resolve(method, request.path)
            request.path_params = params
            response = handler(request)
        except HTTPError as error:
            # Errors we know how to answer: turn them into a JSON response
            # and drop the keep-alive connection. Anything else is a
            # programming error and must propagate untouched -- socketserver
            # prints the traceback and closes the connection. No 500 fallback.
            self.close_connection = True
            response = _error_response(error)
        self._send(response)

    def _build_request(self, method: str) -> Request:
        split = urlsplit(self.path)
        query = {key: values[0] for key, values in parse_qs(split.query).items()}
        return Request(method, split.path, query, self.headers, self._read_body())

    def _read_body(self) -> bytes:
        length = self.headers.get("Content-Length")
        if length is None:
            return b""
        try:
            size = int(length)
        except ValueError:
            raise HTTPError(400, "invalid Content-Length") from None
        if size < 0:
            raise HTTPError(400, "invalid Content-Length")
        return self.rfile.read(size)

    def _send(self, response: Response) -> None:
        self.send_response(response.status)
        for name, value in response.headers.items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(response.body)))
        self.end_headers()
        if response.body:
            self.wfile.write(response.body)


def _error_response(error: HTTPError) -> Response:
    response = Response.json({"error": error.message}, status=error.status)
    response.headers.update(error.headers)
    return response


class _Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, address, router: Router) -> None:
        self.router = router
        super().__init__(address, _Handler)


def make_server(router: Router, host: str = "127.0.0.1", port: int = 0) -> _Server:
    """Bind a server; port 0 picks a free ephemeral port (handy for tests).

    Returns the bound server without serving; call ``serve_forever()``
    yourself (in a thread) or use :func:`serve`.
    """
    return _Server((host, port), router)


def serve(router: Router, host: str = "127.0.0.1", port: int = 8000) -> None:
    """Run the server in the foreground until Ctrl-C."""
    server = make_server(router, host, port)
    host, port = server.server_address[:2]
    print(f"mini_http serving on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
