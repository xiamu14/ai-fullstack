"""mini_http: a minimal HTTP service framework built on the Python stdlib."""

from .core import HTTPError, InvalidJSONError, Request, Response
from .router import Router
from .server import make_server, serve

__all__ = [
    "HTTPError",
    "InvalidJSONError",
    "Request",
    "Response",
    "Router",
    "make_server",
    "serve",
]

__version__ = "0.1.0"
