import httpx
from pydantic_ai import ModelRetry


async def web_fetch(url: str) -> str:
    """获取 HTTP/HTTPS 网页，返回响应文本（HTML 不转正文）；失败时返回错误。

    Args:
        url: 网页的完整 HTTP 或 HTTPS 地址。
    """
    try:
        if httpx.URL(url).scheme not in ("http", "https"):
            raise ValueError("只支持 HTTP 或 HTTPS 地址")
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
        return response.text
    except (httpx.HTTPError, httpx.InvalidURL, ValueError) as exc:
        raise ModelRetry(f"网页获取失败：{exc}") from exc
