import argparse
import asyncio
import json
from pathlib import Path
from uuid import uuid4

import httpx
from playwright.async_api import Error as BrowserError, async_playwright


async def download_image(workspace: Path, url: str, selector: str, output_dir: str = "outputs") -> dict:
    """渲染网页，下载 CSS 选择器匹配的第一张图片，返回状态、来源和保存路径。

    Args:
        url: HTTP 或 HTTPS 网页地址。
        selector: 精确匹配目标 img 的 CSS 选择器。
        output_dir: 工作目录内的保存目录，默认 outputs。
    """
    try:
        if httpx.URL(url).scheme not in ("http", "https"):
            raise ValueError("只支持 HTTP 或 HTTPS 地址")
        target = (workspace / output_dir).resolve()
        if not target.is_relative_to(workspace.resolve()):
            raise ValueError("保存目录必须位于工作目录内")
        async with asyncio.timeout(60), async_playwright() as playwright:
            browser = await playwright.chromium.launch(channel="chromium", headless=False)
            try:
                context = await browser.new_context(locale="en-US")
                page = await context.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                image = page.locator(selector).first
                await image.wait_for(state="attached", timeout=15000)
                source = await image.evaluate("img => img.currentSrc || img.src")
                if httpx.URL(source).scheme not in ("http", "https"):
                    raise ValueError("目标不是 HTTP/HTTPS 图片")
                cookies = httpx.Cookies()
                for cookie in await context.cookies(source):
                    cookies.set(cookie["name"], cookie["value"], domain=cookie["domain"], path=cookie["path"])
                async with httpx.AsyncClient(timeout=30, follow_redirects=True, cookies=cookies) as client:
                    response = await client.get(source, headers={"Referer": page.url})
                content_type = response.headers.get("content-type", "").split(";")[0]
                extensions = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
                if not response.is_success or content_type not in extensions:
                    raise ValueError(f"图片下载失败：HTTP {response.status_code}，类型 {content_type}")
                content = response.content
                if not content:
                    raise ValueError("图片内容为空")
                target.mkdir(parents=True, exist_ok=True)
                path = target / (uuid4().hex + extensions[content_type])
                with path.open("xb") as file:
                    file.write(content)
                return {"status": "saved", "source": source, "path": str(path), "bytes": len(content)}
            finally:
                await browser.close()
    except (BrowserError, TimeoutError, OSError, ValueError, httpx.HTTPError, httpx.InvalidURL) as exc:
        return {"status": "failed", "error": str(exc)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="渲染网页并下载指定图片")
    parser.add_argument("url")
    parser.add_argument("selector")
    parser.add_argument("--workspace", type=Path, default=Path.cwd())
    parser.add_argument("--output-dir", default="outputs")
    args = parser.parse_args()
    result = asyncio.run(download_image(args.workspace, args.url, args.selector, args.output_dir))
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(0 if result["status"] == "saved" else 1)
