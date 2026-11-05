"""Routing: (method, path pattern) -> handler, with ``{name}`` path params."""

from __future__ import annotations

import re
from collections.abc import Callable

from .core import HTTPError, Request, Response

__all__ = ["SUPPORTED_METHODS", "Router"]

SUPPORTED_METHODS = ("GET", "POST", "PATCH", "PUT", "DELETE")

_PARAM = re.compile(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}")


def _compile(pattern: str) -> re.Pattern[str]:
    """Compile ``/items/{id}`` into ``^/items/(?P<id>[^/]+)$``.

    Paths match exactly; a trailing slash is a different path.
    """
    segments = [segment for segment in pattern.strip("/").split("/") if segment]
    parts = []
    for segment in segments:
        param = _PARAM.fullmatch(segment)
        parts.append(f"(?P<{param.group(1)}>[^/]+)" if param else re.escape(segment))
    body = "/".join(parts)
    return re.compile(f"^/{body}$" if body else "^/$")


class Router:
    """Registers handlers and resolves requests to (handler, path params)."""

    def __init__(self) -> None:
        self._routes: list[tuple[str, re.Pattern[str], Callable[[Request], Response]]] = []

    def add(self, method: str, pattern: str, handler: Callable[[Request], Response]):
        """Register ``handler`` for ``method`` + ``pattern``; returns the handler."""
        method = method.upper()
        if method not in SUPPORTED_METHODS:
            raise ValueError(f"unsupported method: {method!r}")
        self._routes.append((method, _compile(pattern), handler))
        return handler

    def get(self, pattern: str):
        return lambda handler: self.add("GET", pattern, handler)

    def post(self, pattern: str):
        return lambda handler: self.add("POST", pattern, handler)

    def patch(self, pattern: str):
        return lambda handler: self.add("PATCH", pattern, handler)

    def put(self, pattern: str):
        return lambda handler: self.add("PUT", pattern, handler)

    def delete(self, pattern: str):
        return lambda handler: self.add("DELETE", pattern, handler)

    def resolve(self, method: str, path: str) -> tuple[Callable[[Request], Response], dict[str, str]]:
        """Return ``(handler, path_params)`` for the request.

        Raises HTTPError 404 when no pattern matches the path at all, and
        HTTPError 405 (with an Allow header) when the path exists but not
        for this method.
        """
        method = method.upper()
        allowed: set[str] = set()
        for route_method, regex, handler in self._routes:
            match = regex.match(path)
            if match is None:
                continue
            if route_method == method:
                return handler, match.groupdict()
            allowed.add(route_method)
        if allowed:
            allow = ", ".join(sorted(allowed))
            raise HTTPError(405, f"method {method} not allowed for {path}", {"Allow": allow})
        raise HTTPError(404, f"no route for {path}")
