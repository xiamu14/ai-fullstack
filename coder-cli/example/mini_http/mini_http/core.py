"""Core primitives: request/response objects and framework errors."""

from __future__ import annotations

import json

__all__ = ["HTTPError", "InvalidJSONError", "Request", "Response"]


class HTTPError(Exception):
    """Aborts a request with a concrete HTTP status.

    Both the framework (router, body parsing) and application handlers raise
    it; the server turns it into a JSON error response.
    """

    def __init__(
        self, status: int, message: str, headers: dict[str, str] | None = None
    ) -> None:
        super().__init__(message)
        self.status = status
        self.message = message
        self.headers = dict(headers or {})


class InvalidJSONError(HTTPError):
    """Raised when a request body is missing or is not valid JSON (400)."""

    def __init__(self, message: str = "invalid JSON body") -> None:
        super().__init__(400, message)


class Request:
    """One parsed HTTP request handed to a route handler."""

    def __init__(
        self,
        method: str,
        path: str,
        query: dict[str, str],
        headers,
        body: bytes,
        path_params: dict[str, str] | None = None,
    ) -> None:
        self.method = method
        self.path = path
        self.query = query  # first value of every query-string key
        self.headers = headers  # email.message.Message; case-insensitive access
        self.body = body
        self.path_params = path_params or {}

    def json(self):
        """Parse the body as JSON.

        Raises InvalidJSONError when the body is empty or malformed; the
        server converts that into a 400 response.
        """
        if not self.body:
            raise InvalidJSONError("request body is empty")
        try:
            return json.loads(self.body)
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise InvalidJSONError(f"invalid JSON body: {exc}") from exc


class Response:
    """An HTTP response; use Response.json for JSON payloads."""

    def __init__(
        self,
        status: int = 200,
        body: bytes = b"",
        headers: dict[str, str] | None = None,
    ) -> None:
        self.status = status
        self.body = body
        self.headers = dict(headers or {})

    @classmethod
    def json(
        cls,
        data,
        status: int = 200,
        headers: dict[str, str] | None = None,
    ) -> "Response":
        """Serialize ``data`` as a UTF-8 JSON response body."""
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        response = cls(status, payload, headers)
        response.headers.setdefault("Content-Type", "application/json; charset=utf-8")
        return response
