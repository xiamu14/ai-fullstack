"""Tavily search; URL fetching is provided by the native WebFetch capability."""

import os
from typing import Annotated

import httpx
from pydantic import Field
from pydantic_ai import ModelRetry
from tavily import AsyncTavilyClient
from tavily.errors import BadRequestError, TimeoutError as TavilyTimeout


async def web_search(query: Annotated[str, Field(min_length=1, max_length=2000)]) -> list[dict]:
    """Search the web with Tavily and return source titles, URLs, and content snippets."""
    key = os.getenv("TAVILY_API_KEY")
    if not key:
        raise ModelRetry("网页搜索需要配置 TAVILY_API_KEY。")
    try:
        async with AsyncTavilyClient(api_key=key) as client:
            response = await client.search(
                query, search_depth="basic", max_results=5,
                include_answer=False, include_raw_content=False, timeout=30,
            )
    except (BadRequestError, TavilyTimeout, httpx.RequestError) as exc:
        raise ModelRetry(f"Tavily 搜索失败（{type(exc).__name__}），请调整查询或稍后重试。") from None
    return [{key: item[key] for key in ("title", "url", "content")} for item in response["results"]]
