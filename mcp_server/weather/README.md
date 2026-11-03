# Weather MCP

按 [MCP 官方示例](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)实现，使用美国国家气象局数据，无需 API Key，仅支持美国地区。

- `get_alerts(state)`：按两位州代码查询预警，例如 `CA`。
- `get_forecast(latitude, longitude)`：按经纬度查询未来五个时段的预报。

默认使用 Streamable HTTP，先在本目录启动服务，地址为 `http://127.0.0.1:8000/mcp`：

```bash
uv sync --locked
uv run weather.py
```

客户端 `coder-cli/main.py` 已连接该地址。两端的 stdio 写法保留为注释，切换时启用 stdio、注释 HTTP。stdio 由客户端启动，日志不能写入 stdout。

验证工具与两种传输：

```bash
uv run python -m unittest -v
```
