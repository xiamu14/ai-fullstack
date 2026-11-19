"""Example: an in-memory items API served with mini_http.

Run it (from the mini_http/ directory):

    python3 app.py          # http://127.0.0.1:8000
    python3 app.py 9000     # custom port
"""

from __future__ import annotations

import sys
import threading

from mini_http import HTTPError, Response, Router, serve

ITEM_FIELDS = frozenset({"name"})


def create_router() -> Router:
    """Build the items API with its own fresh, thread-safe store."""
    router = Router()
    items: dict[int, dict] = {}
    state = {"next_id": 1}
    lock = threading.Lock()

    def item_id(request) -> int:
        """Parse the {id} path parameter; non-numeric ids are 404."""
        raw = request.path_params["id"]
        try:
            return int(raw)
        except ValueError:
            raise HTTPError(404, f"no item with id {raw!r}") from None

    def existing_item(request) -> dict:
        """Return the requested item; callers must hold the lock."""
        item = items.get(item_id(request))
        if item is None:
            raise HTTPError(404, f"no item with id {request.path_params['id']!r}")
        return item

    def checked_fields(data, *, require_name: bool) -> str | None:
        """Validate a JSON object body; returns the (stripped) name or None.

        Only the "name" field exists; anything else is rejected with 400.
        """
        if not isinstance(data, dict):
            raise HTTPError(400, "JSON body must be an object")
        unknown = set(data) - ITEM_FIELDS
        if unknown:
            raise HTTPError(400, f"unknown fields: {', '.join(sorted(unknown))}")
        name = data.get("name")
        if (require_name or "name" in data) and (
            not isinstance(name, str) or not name.strip()
        ):
            raise HTTPError(400, "field 'name' must be a non-empty string")
        return name.strip() if isinstance(name, str) else None

    @router.get("/items")
    def list_items(request):
        with lock:
            snapshot = [dict(item) for item in items.values()]
        snapshot.sort(key=lambda item: item["id"])
        return Response.json(snapshot)

    @router.post("/items")
    def create_item(request):
        name = checked_fields(request.json(), require_name=True)
        with lock:
            item = {"id": state["next_id"], "name": name}
            state["next_id"] += 1
            items[item["id"]] = item
        return Response.json(dict(item), status=201)

    @router.get("/items/{id}")
    def get_item(request):
        with lock:
            item = existing_item(request)
            return Response.json(dict(item))

    @router.patch("/items/{id}")
    def patch_item(request):
        name = checked_fields(request.json(), require_name=False)
        with lock:
            item = existing_item(request)
            if name is not None:
                item["name"] = name
            return Response.json(dict(item))

    @router.put("/items/{id}")
    def put_item(request):
        name = checked_fields(request.json(), require_name=True)
        with lock:
            item = existing_item(request)
            item["name"] = name
            return Response.json(dict(item))

    @router.delete("/items/{id}")
    def delete_item(request):
        with lock:
            existing_item(request)
            del items[item_id(request)]
        return Response(status=204)

    return router


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    port = int(argv[0]) if argv else 8000
    serve(create_router(), "127.0.0.1", port)


if __name__ == "__main__":
    main()
