"""Tests for the example items API in app.py.

Every test starts a fresh server on an ephemeral localhost port (port 0,
assigned by the OS) and shuts it down afterwards; nothing outside
127.0.0.1 is contacted and no external service is used.

Run (from the mini_http/ directory):

    python3 -m unittest test_app -v
"""

from __future__ import annotations

import json
import threading
import unittest
import urllib.error
import urllib.request

from app import create_router
from mini_http import make_server


class ItemsAPITest(unittest.TestCase):
    def setUp(self) -> None:
        self.server = make_server(create_router(), "127.0.0.1", 0)
        host, port = self.server.server_address[:2]
        self.base_url = f"http://{host}:{port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.assertFalse(self.thread.is_alive())

    def request(self, method: str, path: str, payload=None, raw_body=None):
        """Send one request; returns (status, headers, decoded JSON or None)."""
        body = raw_body
        if body is None and payload is not None:
            body = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"} if body is not None else {}
        req = urllib.request.Request(
            self.base_url + path, data=body, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(req) as response:
                status, resp_headers, raw = response.status, response.headers, response.read()
        except urllib.error.HTTPError as error:
            status, resp_headers, raw = error.code, error.headers, error.read()
        return status, resp_headers, json.loads(raw) if raw else None

    # -- happy paths ----------------------------------------------------

    def test_list_starts_empty(self):
        status, _, body = self.request("GET", "/items")
        self.assertEqual((status, body), (200, []))

    def test_create_returns_201_with_id(self):
        status, _, body = self.request("POST", "/items", {"name": "apple"})
        self.assertEqual(status, 201)
        self.assertEqual(body, {"id": 1, "name": "apple"})

    def test_created_items_are_listed_in_order(self):
        self.request("POST", "/items", {"name": "apple"})
        self.request("POST", "/items", {"name": "pear"})
        status, _, body = self.request("GET", "/items")
        self.assertEqual(status, 200)
        self.assertEqual(body, [{"id": 1, "name": "apple"}, {"id": 2, "name": "pear"}])

    def test_get_item_by_id(self):
        self.request("POST", "/items", {"name": "apple"})
        status, _, body = self.request("GET", "/items/1")
        self.assertEqual((status, body), (200, {"id": 1, "name": "apple"}))

    def test_patch_updates_name(self):
        self.request("POST", "/items", {"name": "apple"})
        status, _, body = self.request("PATCH", "/items/1", {"name": "green apple"})
        self.assertEqual(status, 200)
        self.assertEqual(body, {"id": 1, "name": "green apple"})
        _, _, stored = self.request("GET", "/items/1")
        self.assertEqual(stored["name"], "green apple")

    def test_put_replaces_name(self):
        self.request("POST", "/items", {"name": "apple"})
        status, _, body = self.request("PUT", "/items/1", {"name": "pear"})
        self.assertEqual(status, 200)
        self.assertEqual(body, {"id": 1, "name": "pear"})

    def test_delete_returns_204_then_item_is_gone(self):
        self.request("POST", "/items", {"name": "apple"})
        status, _, body = self.request("DELETE", "/items/1")
        self.assertEqual((status, body), (204, None))
        status, _, _ = self.request("GET", "/items/1")
        self.assertEqual(status, 404)

    # -- error handling ---------------------------------------------------

    def test_invalid_json_body_returns_400(self):
        status, _, body = self.request("POST", "/items", raw_body=b"{not json")
        self.assertEqual(status, 400)
        self.assertIn("invalid JSON", body["error"])

    def test_empty_body_returns_400(self):
        status, _, body = self.request("POST", "/items", raw_body=b"")
        self.assertEqual(status, 400)
        self.assertIn("error", body)

    def test_missing_name_returns_400(self):
        status, _, body = self.request("POST", "/items", {})
        self.assertEqual(status, 400)
        self.assertIn("name", body["error"])

    def test_unknown_field_returns_400(self):
        status, _, body = self.request("POST", "/items", {"title": "x"})
        self.assertEqual(status, 400)
        self.assertIn("title", body["error"])

    def test_get_missing_item_returns_404(self):
        status, _, body = self.request("GET", "/items/42")
        self.assertEqual(status, 404)
        self.assertIn("error", body)

    def test_get_non_numeric_id_returns_404(self):
        status, _, _ = self.request("GET", "/items/abc")
        self.assertEqual(status, 404)

    def test_patch_missing_item_returns_404(self):
        status, _, body = self.request("PATCH", "/items/42", {"name": "x"})
        self.assertEqual(status, 404)
        self.assertIn("error", body)

    def test_method_not_allowed_returns_405_with_allow(self):
        status, headers, body = self.request("DELETE", "/items")
        self.assertEqual(status, 405)
        self.assertIn("GET", headers["Allow"])
        self.assertIn("POST", headers["Allow"])
        self.assertIn("error", body)

    def test_unknown_path_returns_404(self):
        status, _, body = self.request("GET", "/nope")
        self.assertEqual(status, 404)
        self.assertIn("error", body)


if __name__ == "__main__":
    unittest.main()
