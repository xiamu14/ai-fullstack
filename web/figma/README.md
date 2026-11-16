# Local Figma Reader (`web/figma`)

基于 **Figma 本地开发插件 + Bun WebSocket 桥接** 的只读设计稿提取工具。无需 Personal Access Token，不走远程 REST API，直接从本地打开的 Figma Desktop 内存中读取节点结构、Auto Layout、计算 CSS、本地样式/变量以及导出 SVG/PNG 切图与 React 图标组件，并默认对数据进行 **面向 AI 的极简压缩**（节省约 90%+ Token）。

## 目录结构（按读取策略 `readers/` 与压缩策略 `compact/` 独立分类）

```text
web/figma/
├── protocol/
│   └── types.ts                       # 本地桥接通信协议与只读数据结构定义
├── readers/                           # 【本地读取策略】按功能域拆分的独立读取器
│   ├── document-reader.ts             # 读取文档概览与页面列表
│   ├── color-style-reader.ts          # 读取颜色、渐变、阴影样式与 Variables（含本地缓存策略）
│   ├── typography-reader.ts           # 读取排版样式 (Text Styles) 与字体变量 (Type Variables)
│   ├── icon-asset-reader.ts           # 按名称/ID/选中项读取并导出 SVG / PNG 及 React 图标组件
│   └── component-node-reader.ts       # 读取画布组件/节点树（含 INSTANCE 容错遍历与 CSS Token 提取）
├── compact/                           # 【AI 压缩策略】按功能域拆分的独立压缩与转换器
│   ├── color-compact.ts               # 0-1 RGBA 浮点转 #HEX / rgba()、渐变与阴影 CSS 简写
│   ├── typography-compact.ts          # 排版字阶合并、默认字体提取、字重数组归一化与行高/字间距压缩
│   ├── styles-compact.ts              # 本地样式与 Variables 集合嵌套分组及关键词过滤
│   ├── icon-svg-compact.ts            # SVG 路径精度压缩、公共属性提升 (Attribute Hoisting) 与清理
│   ├── icon-react-compact.ts          # SVG 转支持 fontSize / color 的 React 图标组件 (.tsx)
│   └── component-node-compact.ts      # Variant 属性解析、插槽标注 (slot)、INSTANCE 剪枝与 Token 提炼
├── plugin/                            # 【Figma 插件端】运行于 Figma Desktop 沙箱内的桥接插件
│   ├── manifest.json                  # Figma Desktop 本地开发插件配置
│   ├── ui.html                        # 插件界面（Tailwind 样式与配对表单）
│   ├── ui.ts                          # 配对、消息校验与自动重连 ws://localhost:38450/ws
│   ├── code.ts                        # 插件沙箱主入口（只读指令分发）
│   ├── code.js                        # 由 Bun 打包生成的插件运行产物
│   └── readers/
│       ├── figma-types.ts             # Figma Plugin API 最小只读类型声明
│       ├── node-serializer.ts         # 节点布局、文本、图层样式与属性序列化
│       ├── document-reader.ts         # 插件端文档、选中节点、指定 ID 节点及跨页搜索
│       ├── style-reader.ts            # 插件端计算 CSS (getCSSAsync) 与本地 Styles/Variables
│       └── asset-reader.ts            # 插件端导出节点为 SVG / PNG / JPG (exportAsync)
├── bridge/                            # 【本地通信桥接】
│   ├── server.ts                      # Bun 本地 WebSocket + HTTP 桥接服务端
│   └── client.ts                      # 自动拉起并复用后台常驻桥接服务（保持插件长连接在线）
└── cli/                               # 【CLI 命令行入口】
    ├── build-plugin.ts                # 使用 Bun.build 编译插件脚本
    └── commands.ts                    # CLI 子命令调度
```

## 首次配对

桥接仅监听 `127.0.0.1`。HTTP 请求和 WebSocket 握手均需要配对码，配对码按端口保存在用户目录 `~/.cache/figma-reader-bridge/`，目录权限为 `0700`，文件权限为 `0600`；命令行客户端自动读取。

更新插件源码后，重新生成包含 Tailwind 样式与 UI 脚本的运行产物：

```bash
bun figma/cli.ts build-plugin
```

在 Figma Desktop 中打开本地插件，然后显示配对码并填入插件的“配对码”输入框，点击“连接”：

```bash
bun figma/cli.ts pair
```

配对码仅保存在插件当前运行期间的内存中，不放入 URL。`pair` 与读取命令都会自动启动桥接服务；也可先运行 `bun figma/cli.ts serve`。当前插件 UI 连接默认端口 `38450`。

旧版常驻服务不支持鉴权，需要先停止旧进程再运行新版；客户端会识别旧服务并提示，不会继续向旧服务发送读取请求。

## 常用命令

```bash
# 查看帮助
bun figma/cli.ts --help

# 1. 读取颜色样式（按关键词过滤，如 Purple 色板）
bun figma/cli.ts styles --filter purple

# 2. 读取 Typography 排版字阶与字体变量
bun figma/cli.ts typography

# 3. 读取当前在 Figma 中选中的 Variant 组件层级（自动解析 variants、slot 与 tokens）
bun figma/cli.ts selection

# 4. 搜索图标并同时导出压缩 SVG 与支持 fontSize/color 的 React 组件
bun figma/cli.ts export --page "Icons" --query "2 User" \
  --out ./src/sources/images \
  --react-out ./src/components/atom/icons
```
