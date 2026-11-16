## 快速使用步骤

1.   导入并运行本地插件：
     在 Figma Desktop 顶部菜单选择 Plugins -> Development -> Import plugin from manifest...，选中
     ~/Workspace/Project/ai-fullstack/backend-course/web/figma/plugin/manifest.json 并启动插件。
2.   在 web/ 目录下执行读取命令：# 读取当前打开的文档与页面列表
     bun figma/cli.ts document

    # 读取当前在 Figma 中选中的节点（递归 3 层并附带计算 CSS）

    bun figma/cli.ts selection --depth 3 --css

    # 读取指定节点 ID 的结构并保存为 JSON
    bun figma/cli.ts node --id 12:34 --css --out ./node.json

    # 仅读取当前选中节点的 CSS
    bun figma/cli.ts css

    # 读取本地样式与设计变量 (Variables)
    bun figma/cli.ts styles --out ./tokens.json

    # 将当前选中节点导出为 SVG 到本地目录
    bun figma/cli.ts export --format SVG --out ./assets
