# Local Figma Reader (`web/figma`)

基于 **Figma 本地开发插件 + Bun WebSocket 桥接** 的只读设计稿提取工具。无需 Personal Access Token，不走远程 REST API，直接从本地打开的 Figma Desktop 内存中读取节点结构、Auto Layout、计算 CSS、本地样式/变量以及导出 SVG/PNG 切图，并默认对数据进行 **面向 AI 的极简压缩**（去除内部 Hash、默认属性、将 RGBA 浮点转换为 `#HEX` / CSS 简写，节省约 90%+ Token）。

## 目录结构（按只读功能划分）

```text
web/figma/
├── protocol/
│   └── types.ts                # 本地桥接通信协议与只读数据结构定义
├── compact/
│   ├── color.ts                # 0-1 RGBA 浮点转 #HEX / rgba()、渐变与阴影 CSS 简写
│   ├── typography.ts           # Typography 字阶合并、字重归一化与行高/字间距压缩
│   ├── svg.ts                  # SVG 路径精度与公共属性提升压缩 + React Icon 组件生成
│   ├── styles-compactor.ts     # 本地样式 (Paint/Text/Effect) 与 Variables 极简压缩与过滤
│   └── node-compactor.ts       # 画布节点树极简压缩（剔除隐藏层、默认属性与冗余坐标）
├── plugin/
│   ├── manifest.json           # Figma Desktop 本地开发插件配置
│   ├── ui.html                 # 插件 UI 桥接层（自动连接 ws://localhost:38450/ws）
│   ├── code.ts                 # 插件沙箱主入口（只读指令分发）
│   ├── code.js                 # 由 Bun 打包生成的插件运行产物
│   └── readers/
│       ├── figma-types.ts      # Figma Plugin API 最小只读类型声明
│       ├── node-serializer.ts  # 节点布局、文本、图层样式与属性序列化
│       ├── document-reader.ts  # 读取文档概览、当前选中节点、指定 ID 节点及跨页搜索
│       ├── style-reader.ts     # 读取节点计算 CSS (getCSSAsync) 与本地 Styles/Variables
│       └── asset-reader.ts     # 导出节点为 SVG / PNG / JPG (exportAsync)
├── bridge/
│   ├── server.ts               # Bun 本地 WebSocket + HTTP 桥接服务端
│   └── client.ts               # 自动复用常驻服务或单次临时启动 WebSocket 桥接
└── cli/
    ├── build-plugin.ts         # 使用 Bun.build 编译插件脚本
    └── commands.ts             # 各只读子命令实现
```

## 1. 在 Figma Desktop 中加载插件（仅需首次）

1. 打开 Figma 桌面客户端并进入任意设计稿。
2. 顶部菜单选择 **`Plugins` -> `Development` -> `Import plugin from manifest...`**。
3. 选择本目录下的 [`plugin/manifest.json`](./plugin/manifest.json)。
4. 运行插件 **`Plugins` -> `Development` -> `Local Figma Reader Bridge`**，保持小窗开启（会自动重连 `ws://localhost:38450/ws`）。

## 2. 使用 Bun 脚本读取本地设计稿（默认开启 AI 极简压缩）

```bash
# 查看帮助
bun figma/cli.ts --help

# 1. 读取并按关键词过滤样式/变量（例如只读取 Purple 色板）
bun figma/cli.ts styles --filter purple

# 2. 读取全部压缩后的设计 Token（Colors / Typography / Effects / Variables）
bun figma/cli.ts styles --out ./figma-tokens.json

# 3. 按页面与名称路径搜索画布节点（需重新运行一次插件以加载最新 code.js）
bun figma/cli.ts find --page "Style Guide" --query "colors/purple" --depth 3

# 4. 读取当前在 Figma 中鼠标选中的节点树（默认压缩，加 --raw 可看原始结构）
bun figma/cli.ts selection --depth 3

# 5. 根据节点 ID 读取指定节点
bun figma/cli.ts node --id 12:34 --depth 4 --out ./figma-node.json

# 6. 按名称搜索图标并同时导出压缩 SVG 与支持 fontSize/color 的 React 组件
bun figma/cli.ts export --page "Icons" --query "2 User" \
  --out ./src/sources/images \
  --react-out ./src/components/atom/icons

# 7. 导出为 PNG 位图
bun figma/cli.ts export --page "Icons" --query "2 User" --format PNG --scale 2 --out ./src/sources/images
```
