"""Print OpenAI Chat request bodies before and after tool discovery; no network calls."""
import asyncio
import json

import httpx2 as httpx
from pydantic_ai import Agent, Tool
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider


def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather for {city}"


def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a recipient."""
    return "Sent"


async def capture(deferred: bool) -> list[dict]:
    requests = []

    def respond(request: httpx.Request) -> httpx.Response:
        requests.append(json.loads(request.content))
        if deferred and len(requests) == 1:
            message = {
                "role": "assistant", "content": None,
                "tool_calls": [{"id": "search-1", "type": "function", "function": {
                    "name": "search_tools", "arguments": json.dumps({"queries": ["weather"]}),
                }}],
            }
        else:
            message = {"role": "assistant", "content": "Done"}
        return httpx.Response(200, json={
            "id": "comparison", "object": "chat.completion", "created": 0, "model": "demo",
            "choices": [{"index": 0, "finish_reason": "tool_calls" if message.get("tool_calls") else "stop",
                         "message": message}],
        })

    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as client:
        model = OpenAIChatModel("demo", provider=OpenAIProvider(
            base_url="https://example.invalid/v1", api_key="not-a-real-key", http_client=client,
        ))
        agent = Agent(model, tools=[
            Tool(get_weather, defer_loading=deferred), Tool(send_email, defer_loading=deferred),
        ])
        await agent.run("What is the weather in Guangzhou?")
    return requests


async def main() -> None:
    before, after = await capture(False), await capture(True)

    def names(request):
        return [tool["function"]["name"] for tool in request.get("tools", [])]

    assert names(before[0]) == ["get_weather", "send_email"]
    assert names(after[0]) == ["search_tools"]
    assert len(after) == 2
    assert names(after[1]) == ["get_weather", "search_tools"]
    for label, request in [("启用前", before[0]), ("启用后：发现前", after[0]), ("启用后：发现后", after[1])]:
        # Tool schemas are API tools; discovery instructions/results may also be in messages.
        print(label)
        print(json.dumps({key: request.get(key, []) for key in ("tools", "messages")},
                         ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
