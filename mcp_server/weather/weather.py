import argparse
from typing import Annotated, Any

import httpx
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from pydantic import Field

mcp = MCPServer("weather")
API = "https://api.weather.gov"


async def fetch(url: str) -> dict:
    async with httpx.AsyncClient(
        headers={"User-Agent": "learn-agent-weather/0.1", "Accept": "application/geo+json"},
        timeout=20,
        follow_redirects=True,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


@mcp.tool(structured_output=True)
async def get_alerts(state: Annotated[str, Field(pattern=r"^[A-Za-z]{2}$")]) -> dict[str, Any]:
    """查询美国州的天气预警。state 为两位州代码，例如 CA、NY。"""
    try:
        data = await fetch(f"{API}/alerts/active/area/{state.upper()}")
        return {"alerts": [
            {key: item["properties"].get(key) for key in ("event", "areaDesc", "severity", "description", "instruction")}
            for item in data["features"]
        ]}
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        raise ToolError(f"天气预警查询失败：{exc}") from exc


@mcp.tool(structured_output=True)
async def get_forecast(
    latitude: Annotated[float, Field(ge=-90, le=90)],
    longitude: Annotated[float, Field(ge=-180, le=180)],
) -> dict[str, Any]:
    """按经纬度查询美国地区未来五个时段的天气预报；不支持美国以外地区。"""
    try:
        location = await fetch(f"{API}/points/{latitude},{longitude}")
        forecast_url = location["properties"]["forecast"]
        if not forecast_url.startswith(f"{API}/"):
            raise ValueError("预报地址不属于 api.weather.gov")
        data = await fetch(forecast_url)
        return {"periods": data["properties"]["periods"][:5]}
    except (httpx.HTTPError, ValueError, KeyError, TypeError, AttributeError) as exc:
        raise ToolError(f"天气预报查询失败：{exc}") from exc


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="本地天气 MCP 服务")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    # mcp.run(transport="stdio")
    mcp.run(transport="streamable-http", host="127.0.0.1", port=args.port)
