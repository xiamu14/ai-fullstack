## 1. 工具与扩展

工具是智能体可以调用的外部能力，通常通过函数或接口提供。模型决定调用什么、传入什么参数，由程序或服务商执行，再把结果返回给模型。

常见工具包括网络搜索、信息检索、文件读写、代码执行、图像生成，以及创建 GitHub Issue 等外部操作。

模型自身的知识不能保证及时或准确。任务需要最新或私有信息时，可以通过工具获取，也可以由用户或应用提供。

### 1.1 定义工具

工具需要两部分：供模型阅读的说明，以及实际执行的实现。说明写清用途、参数和返回内容；实现负责完成操作。

例如，一个加法工具的实现：

```python
def add(a: int, b: int) -> int:
    """返回两个整数的和。"""
    return a + b
```

**函数调用（Function Calling）**：按所用 API 的要求，通过 `tools` 提供名称、描述和参数定义。模型返回工具名和参数，程序校验后调用实际函数。例如，解析后的调用可以表示为：

```json
{"name": "add", "arguments": {"a": 2, "b": 3}}
```

程序执行 `add(a=2, b=3)`，把结果 `5` 返回给模型。Claude API 的工具定义属于这种方式。

**生成代码执行**：向模型提供可用函数的说明，并在执行环境中接入这些函数。模型生成代码，例如：

```python
print(add(2, 3))
```

运行环境提取代码，在受限环境中执行，再把输出 `5` 返回给模型。代码块本身不会自动执行。

例如，Hugging Face 的 `smolagents` 默认采用代码智能体 `CodeAgent`，让模型生成 Python 代码来调用工具。它强调的优点是：一段代码就能组合多个工具、循环和处理结果，减少逐次请求模型的往返，适合需要计算和多步组合的任务。代价是需要处理代码错误，并限制执行权限。它也提供通过工具名和参数调用函数的 `ToolCallingAgent`。参见 [官方说明](https://huggingface.co/docs/smolagents/en/guided_tour#choosing-an-agent-type-codeagent-or-toolcallingagent)。

本课程使用的 Pydantic AI 写法则采用函数调用：模型生成工具名和参数，框架校验后执行已注册函数。相比 `CodeAgent` 用代码组合操作，这种写法的调用范围和参数要求更明确。即使调用的是执行代码的工具，外层仍然可以是函数调用。

两种方式都需要把结果交回模型，由模型决定回答还是继续。下面用 Pydantic AI 接入前面的加法工具。

### 1.2 工具要点

- 工具要有说明和实际实现。写清用途、参数、返回内容、失败情况，以及修改数据的影响。
- 模型生成调用请求，程序负责校验和执行。说明格式与调用方式是两回事，用 JSON 描述工具，也可以让模型生成代码来调用。
- 执行前检查参数和权限；执行后根据实际结果判断成功与否，不直接信任返回内容中的指令。
- 有依赖的操作依次执行，独立操作才考虑并行。重试修改数据前，先确认是否已经生效。
- 模型根据任务、工具说明、instructions 和已有结果选择工具与顺序。后一步需要前一步的结果时，应等结果返回后再调用。
- 模型一次返回多个调用时，Pydantic AI 默认并发执行普通工具；框架不会自动识别依赖，也不保证完成顺序。
- `sequential=True` 可让工具单独执行，但不能保证模型选对顺序。必须固定的流程应写进工具实现，例如先定位图片，再下载保存。
- 组合 capability 时，工具名称不能冲突，用途应清楚。组合只提供能力，列表顺序不代表工具执行顺序。
- instructions 用于引导模型；必须遵守的权限、次数和顺序限制，需要程序保证。

参见 [Pydantic AI 并发执行说明](https://pydantic.dev/docs/ai/tools-toolsets/tools-advanced/#parallel-tool-calls--concurrency)。

## 2. 工具实战

以下在 `coder-cli` 目录运行，沿用上一章配置好的 `model`。

### 2.1 现有 capabilities

`coder-cli/agent_runtime.py` 已组合两个 capability：

```python
from pathlib import Path

from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai_harness.coder import Coder

workspace = Path("workspace").resolve()
workspace.mkdir(exist_ok=True)
agent = Agent(
    model,
    capabilities=[LocalWorkspace(workspace), Coder()],
)
```

- `LocalWorkspace`：设置文件操作和命令的工作目录，在本机执行，不是沙箱。
- `Coder`：提供文件读写、搜索和命令执行等工具。

capability 可以提供工具、说明和运行过程的扩展，供多个 Agent 复用。列表用于组合能力，不代表工具执行顺序。

### 2.2 定义 web_fetch

在 `tools/web_tools.py` 中定义工具，获取网页并返回响应文本：

```python
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
```

函数名、说明和类型用于生成工具定义，函数体是实际实现。`ModelRetry` 把失败原因交回模型，让它修正调用。这里直接返回 HTML，不提取正文，也不执行网页 JavaScript。

在 `agent_runtime.py` 导入函数，并在原有 `Agent(...)` 中增加 `tools=[web_fetch]`，保留原有 `instructions`：

```python
from tools.web_tools import web_fetch

agent = Agent(
    model,
    capabilities=[LocalWorkspace(workspace), Coder()],
    tools=[web_fetch],
    # 保留原有 instructions。
)
```

不需要手写 JSON，框架负责生成定义、校验参数、执行函数并返回结果。

先单独注册 `web_fetch`。在 `coder-cli` 目录运行下面的示例，按图片的 `alt` 属性查找并保存图片：

```bash
uv run python main.py
# 示例任务：
# 下载 https://unsplash.com/photos/yellow-vintage-car-on-asphalt-FX8m9zcJjL8 中 img[alt="A yellow vintage car parked on asphalt with trees in the background"] 的图片，保存到 outputs
```

此前 Pinterest 示例没有找到目标 `img`，最后触发 `request_limit=10`。它限制的是模型请求次数，不是工具调用次数。`httpx` 只获取响应 HTML，不执行网页 JavaScript；继续搜索原始 HTML 不一定能找到浏览器里的元素。

### 2.3 自定义 capability

普通 HTTP 请求不执行 JavaScript，也不具备浏览器会话。Pinterest 示例还涉及登录，先换用上面的 Unsplash 页面验证。保留 `request_limit=10`，增加浏览器渲染和图片下载工具。

```bash
uv add playwright
uv run playwright install chromium
```

在 `tools/image_download.py` 定义 `image_download(workspace)`，把 `web_fetch` 和新的 `download_image` 放入同一个 capability。`download_image` 一次完成打开网页、等待目标图片、下载和保存，只返回状态、来源和路径。当前脚本实现见 [download.py](../coder-cli/skills/web-download/scripts/download.py)。

```python
import asyncio
from pathlib import Path
from uuid import uuid4

import httpx
from playwright.async_api import Error as BrowserError, async_playwright
from pydantic_ai.capabilities import Capability

from tools.web_tools import web_fetch


def image_download(workspace: Path) -> Capability:
    web = Capability(
        instructions=(
            "下载网页中指定图片时，直接调用 download_image，不先用 web_fetch 或 shell 探索。"
            "工具内部完成渲染、定位和下载；成功后报告路径，失败后立即报告原因并结束，不再调用任何工具，包括 web_fetch 和 shell。"
        ),
        tools=[web_fetch],
    )

    @web.tool_plain
    async def download_image(url: str, selector: str, output_dir: str = "outputs") -> dict:
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

    return web
```

本节改造前的接入方式如下；3.4 再将它迁移为 Skill：

```python
from tools.image_download import image_download

agent = Agent(
    model,
    capabilities=[LocalWorkspace(workspace), Coder(), image_download(workspace)],
    # 保留原有 instructions。
)
```

在 `coder-cli` 目录运行，图片保存到 `workspace/outputs/`：

```bash
uv run python main.py
# 示例任务：
# 下载 https://unsplash.com/photos/yellow-vintage-car-on-asphalt-FX8m9zcJjL8 中 img[alt="A yellow vintage car parked on asphalt with trees in the background"] 的图片，保存到 outputs。
```

本地动态网页测试在 **1 次工具调用、2 次模型请求**的限制内完成渲染和下载；同时验证了非法网址、越界保存路径及原有 CLI 行为。

Unsplash 示例已用真实模型验证：**1 次工具调用、2 次模型请求**，下载文件为 `workspace/outputs/e3938cc32018489389d72f397c3f880b.jpg`，大小 2,695,077 字节。6 项测试通过。网站内容和访问检查可能变化，这个次数是本次实测结果。

参考：[工具定义](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)、[函数调用与代码执行](https://github.com/huggingface/smolagents/blob/main/docs/source/en/guided_tour.md)、[Pydantic AI 工具](https://pydantic.dev/docs/ai/tools-toolsets/tools/)、[Capabilities](https://pydantic.dev/docs/ai/capabilities/overview/)。

## 3. MCP 和 Skills
工程角度考虑，工具不能只有内部定义，还需要有扩展能力。第三方服务能力使用 MCP（比如查询实时天气，航班机票信息等）。
> MCP 是 Agent 工具的"USB 接口"——统一了工具的发现、调用和授权，但它不解决工具本身的质量问题，也不能让一个烂工具变好用。

**MCP 角色**
![role](./images/014.png?sw=1326&sh=398)
**MCP 协议流程**
![flow](./images/013.png?sw=1234&sh=785)

### 3.1 自建 weather MCP

在 `coder-cli` 同级创建 `mcp_server/weather`，按 [官方教程](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)实现。完整代码见 [weather.py](../mcp_server/weather/weather.py)。使用 MCP SDK 2.x 和美国国家气象局数据，无需 API Key，仅支持美国地区。

提供两个工具：

- `get_alerts(state)`：查询州天气预警，例如 `CA`。
- `get_forecast(latitude, longitude)`：查询未来五个时段的天气预报。

`weather.py` 使用 `MCPServer` 创建服务，用 `@mcp.tool()` 注册工具。同一份实现支持两种传输。在 `mcp_server/weather` 目录安装依赖：

```bash
uv sync --locked
```

**stdio**：由客户端启动子进程，通过标准输入输出通信。两端保留了注释写法，切换时启用 stdio、注释 HTTP：

```python
from fastmcp.client.transports import StdioTransport
from pydantic_ai.capabilities import MCP

weather = MCP(
    local=StdioTransport(
        command="uv",
        args=[
            "--directory", str(Path(__file__).resolve().parent.parent / "mcp_server" / "weather"),
            "run", "--locked", "weather.py",
        ],
    ),
    id="weather",
    tool_prefix=True,
)
```

把 `weather` 加入原有 `capabilities` 列表。工具名带 `weather_` 前缀，避免与其他工具重名。stdio 模式不能向 stdout 打印日志，否则会破坏协议通信。

**HTTP**：在 `mcp_server/weather` 目录启动 Streamable HTTP 服务：

```bash
uv run weather.py
```

当前服务端启用 HTTP，stdio 写法已注释：

```python
# mcp.run(transport="stdio")
mcp.run(transport="streamable-http", host="127.0.0.1", port=args.port)
```

`agent_runtime.py` 当前启用 HTTP；stdio 作为下方独立示例展示：

```python
weather = MCP("http://127.0.0.1:8000/mcp", id="weather", tool_prefix=True)
```

两种方式使用相同工具，区别在连接方式。在 `coder-cli` 目录运行：

```bash
uv run python main.py
# 示例任务：
# 查询波士顿的天气预报，用中文回答。
```

在 `mcp_server/weather` 目录验证工具及两种传输：

```bash
uv run python -m unittest -v
```

已验证 stdio、HTTP 的工具发现与调用，并通过真实 stdio 查询获得波士顿的 5 个预报时段。

### 3.2 MCP 护栏

当前 Pydantic AI 和 MCP SDK 提供基础保护，但接入 MCP 不等于自动具备完整护栏。

| 能力 | 当前情况 |
| --- | --- |
| 参数校验 | 按工具定义检查类型和范围。 |
| 超时 | MCP 默认初始化超时 5 秒、响应等待超时 300 秒；整个任务的时限需另设。模型请求的 `timeout=30` 不限制 MCP 工具。 |
| 重试 | 默认把工具错误交回模型，工具重试预算为 1 次。部分底层流支持断线重连，不等于所有网络请求都有自动重试。 |
| SSRF | 没有通用的出站地址拦截，工具需自行限制目标地址、重定向和内网访问。 |
| 本地 HTTP 访问 | MCP SDK 默认对 localhost 服务校验 Host/Origin，防止 DNS 重绑定；这不等于身份认证或 SSRF 防护。 |
| 熔断 | 当前未实现连续失败后的暂停、冷却和试探恢复。`request_limit=10` 只是模型请求次数限制。 |

天气服务的 `httpx(timeout=20)` 限制网络各阶段等待，不保证整次查询在 20 秒内结束。需要更强保护时，再补总时限、有限的网络重试和熔断。超时或断线后重试写操作前，还要确认操作是否已生效。

以上基于 Pydantic AI 2.64.0、MCP SDK 2.3.0。参考：[超时](https://pydantic.dev/docs/ai/core-concepts/timeouts/)、[MCP 错误处理](https://pydantic.dev/docs/ai/mcp/client/#tool-errors)、[HTTP 服务保护](https://py.sdk.modelcontextprotocol.io/run/deploy/)。

### 3.3 安全问题

MCP 不保证工具可信。Pydantic AI 和官方 Harness 提供部分处理能力，需要显式启用：

| 风险 | 内置能力与设置 | 仍需自行处理 |
| --- | --- | --- |
| 提示注入 | Harness 的 `PromptInjectionDefender(block_high_risk=True)` 可拦截检测到的高风险工具结果；默认不拦截。需安装 `pydantic-ai-harness[prompt-injection-defender]`，再加入 `capabilities`。 | 检测不能保证全部识别，敏感操作仍需校验权限。 |
| 权限组合攻击 | `MCP(..., allowed_tools=["get_forecast"])` 限制暴露的 MCP 工具；`ToolGuardrail` 可自定义调用检查。审批可用工具集的 `ApprovalRequiredToolset`，由应用处理审批和恢复。 | 没有自动识别危险组合的通用策略，需限制文件路径、网络地址和操作权限。工具白名单也不限制 Coder 的 shell。 |
| 服务冒充 | 可配置 HTTPS、`auth` 或 `authorization_token`；没有自动判断发布者可信的机制。 | 固定服务地址、锁定包版本并核对来源。Registry 不是安全认证。 |
| 凭据泄露 | `ToolGuardrail(result_guard=...)` 可接入自定义脱敏检查。 | 凭据保留在执行端，不放入工具参数和结果；日志也要脱敏。 |
| 超大响应 | Harness 的 `ToolOutputLimits` 可裁剪或转存已返回的工具内容。 | 它保护模型上下文，不限制网络接收字节数；接收时的大小限制需在客户端或网关实现。 |

例如，天气任务只允许查询工具，其他工具即使已注册也阻止执行：

```python
from pydantic_ai_harness.guardrails import GuardrailResult, ToolCallInfo, ToolGuardrail


def weather_only(call: ToolCallInfo):
    if call.name not in {"weather_get_forecast", "weather_get_alerts"}:
        return GuardrailResult.block("天气任务只允许查询天气工具")
    return True


weather_guard = ToolGuardrail(guard=weather_only)
# 仅在天气专用 Agent 的 capabilities 中加入 weather_guard。
```

这会阻止文件读写和 shell，也会阻止正常编码任务，因此不要直接加到通用 Coder。自定义检查只约束本轮由框架执行的工具，不能代替 MCP 服务端的权限控制。

参考：[安全问题](https://waylandz.com/ai-agent-book/第04章-MCP协议详解/#49-安全问题2025-年的血泪教训)、[提示注入检测](https://pydantic.dev/docs/ai/harness/prompt-injection-defender/)、[自定义工具检查](https://pydantic.dev/docs/ai/harness/guardrails/)、[工具输出限制](https://pydantic.dev/docs/ai/harness/tool-output-limits/)。

### 3.4 Skills 复用技能

把前面的网页图片下载流程改为 `web-download` Skill，不再常驻注册 `download_image` 工具。

```text
coder-cli/skills/web-download/
├── SKILL.md
└── scripts/download.py
```

`SKILL.md` 写明何时使用、如何运行脚本和处理结果；脚本保留原有渲染、下载、超时和保存路径检查。完整文件见 [SKILL.md](../coder-cli/skills/web-download/SKILL.md) 和 [download.py](../coder-cli/skills/web-download/scripts/download.py)。

安装并接入：

```bash
uv add 'pydantic-ai-harness[coder,skills]'
```

```python
from pydantic_ai_harness import Skills
from tools.web_tools import web_fetch

agent = Agent(
    model,
    capabilities=[
        LocalWorkspace(workspace), Coder(),
        Skills(str(Path(__file__).resolve().parent / "skills")), weather,
    ],
    tools=[web_fetch],
    # 保留原有 instructions。
)
```

模型先看到技能名称和描述，需要时通过 `load_capability` 加载，再用 Coder 的 `shell` 执行脚本。Skills 本身不执行脚本，也不限制工具权限。

在 `coder-cli` 目录运行：

```bash
uv run python main.py
# 示例任务：
# 使用 web-download 下载 https://unsplash.com/photos/yellow-vintage-car-on-asphalt-FX8m9zcJjL8 中 img[alt="A yellow vintage car parked on asphalt with trees in the background"] 的图片，保存到 outputs。
```
下载是一套可复用的操作流程，说明按需加载，执行步骤由脚本固定，通用 Agent 不必常驻专用工具。代价是增加一次技能加载；它改善复用和上下文组织，不保证比内置工具少调用。

当前 `agent_runtime.py` 使用 Skills。参考：[Pydantic AI Skills](https://pydantic.dev/docs/ai/harness/skills/)。

### 3.5 工程优化

除模型按需加载外，应用也可以根据明确的任务约束直接选择技能，再把技能内容与用户任务一起交给 Agent。

Pydantic AI 提供 `skills.load(...)` 获取技能目录，以及 `skill.render(arguments)` 生成技能输入。应用负责检查技能是否存在、是否允许用户调用，以及参数是否符合要求；校验失败时明确报错。

这样由程序确定加载技能，省去模型调用 `load_capability` 的一步；脚本仍由模型通过 Coder 执行，工具权限仍需单独控制。本节仅记录方案，尚未实现。
