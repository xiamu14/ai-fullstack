import { parseArgs } from "node:util";
import type { ExportFormat } from "./protocol/types.ts";
import {
  type CliFlags,
  runBuildPluginCommand,
  runCssCommand,
  runDocumentCommand,
  runExportCommand,
  runFindCommand,
  runNodeCommand,
  runPairCommand,
  runSelectionCommand,
  runServeCommand,
  runStylesCommand,
  runTypographyCommand,
} from "./cli/commands.ts";

const HELP_TEXT = `
Figma 本地设计文件只读工具 (Bun + TypeScript · 默认 AI 极简压缩输出)

用法:
  bun figma/cli.ts <command> [options]

命令 (只读):
  document       读取当前打开的 Figma 文档与页面概览
  selection      读取当前在 Figma 中选中的节点树
  node           根据 --id 读取指定节点树
  find           按名称/路径搜索画布节点 (如 --query "2 users")
  css            读取选中节点或指定节点的计算 CSS (getCSSAsync)
  styles         读取文档内的本地样式 (Paint/Text/Effect) 与 Variables
  typography     读取文档内的排版样式 (Text Styles) 与字体变量 (Type Variables)
  export         导出选中节点、--id 或 --query 匹配节点为 SVG / PNG / JPG 及 React 组件
  pair           显示本机配对码，填入 Figma 插件后连接
  serve          启动常驻本地 WebSocket 桥接服务 (首次运行任意命令也会自动后台启动)
  build-plugin   将 figma/plugin/code.ts 编译为 figma/plugin/code.js

选项:
  --id <nodeId>        指定节点 ID (例如 12:34 或 12-34)
  --query <text>       节点名称/路径搜索关键词 (用于 find 和 export)
  --page <name>        限定搜索的页面名称 (用于 find 和 export)
  --filter <text>      按关键词过滤样式或变量 (例如 --filter purple)
  --depth <number>     子节点递归层级 (默认: 2)
  --css                在节点树中附带计算 CSS 属性
  --raw                输出未经压缩的原始数据 (默认开启 AI 极简压缩)
  --refresh            忽略本地样式缓存，强制从 Figma 重新拉取
  --format <fmt>       导出格式: SVG | PNG | JPG (默认: SVG)
  --scale <number>     位图导出倍率 (默认: 1)
  --out <path>         将结果或 SVG/PNG 写入本地文件或目录
  --react-out <path>   将导出的 SVG 同时生成为支持 fontSize/color 的 React 组件 (.tsx)
  --port <number>      本地桥接端口 (默认: 38450)
  -h, --help           查看帮助信息

示例:
  bun figma/cli.ts styles --filter purple
  bun figma/cli.ts typography
  bun figma/cli.ts export --query "2 users" --out ./src/sources/images --react-out ./src/components/atom/icons
`.trim();

function normalizeFormat(raw?: string): ExportFormat | undefined {
  if (!raw) {
    return undefined;
  }
  const upper = raw.toUpperCase();
  if (upper === "SVG" || upper === "PNG" || upper === "JPG") {
    return upper;
  }
  throw new Error(`不支持的导出格式: ${raw}（可选 SVG | PNG | JPG）`);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h", default: false },
      id: { type: "string" },
      query: { type: "string" },
      page: { type: "string" },
      filter: { type: "string" },
      depth: { type: "string" },
      css: { type: "boolean" },
      raw: { type: "boolean", default: false },
      refresh: { type: "boolean", default: false },
      format: { type: "string" },
      scale: { type: "string" },
      out: { type: "string" },
      "react-out": { type: "string" },
      port: { type: "string" },
    },
  });

  const command = positionals[0];
  if (values.help || !command) {
    process.stdout.write(`${HELP_TEXT}\n`);
    return;
  }

  const flags: CliFlags = {
    id: values.id,
    query: values.query,
    page: values.page,
    filter: values.filter,
    depth: values.depth !== undefined ? Number(values.depth) : undefined,
    css: values.css,
    raw: values.raw,
    refresh: values.refresh,
    format: normalizeFormat(values.format),
    scale: values.scale !== undefined ? Number(values.scale) : undefined,
    out: values.out,
    reactOut: values["react-out"],
    port: values.port !== undefined ? Number(values.port) : undefined,
  };

  switch (command) {
    case "document":
      await runDocumentCommand(flags);
      break;
    case "selection":
      await runSelectionCommand(flags);
      break;
    case "node":
      await runNodeCommand(flags);
      break;
    case "find":
      await runFindCommand(flags);
      break;
    case "css":
      await runCssCommand(flags);
      break;
    case "styles":
      await runStylesCommand(flags);
      break;
    case "typography":
      await runTypographyCommand(flags);
      break;
    case "export":
      await runExportCommand(flags);
      break;
    case "pair":
      await runPairCommand(flags);
      break;
    case "serve":
      await runServeCommand(flags);
      break;
    case "build-plugin":
      await runBuildPluginCommand();
      break;
    default:
      throw new Error(`未知命令: ${command}。使用 --help 查看可用命令。`);
  }
}

main().catch((error) => {
  process.stderr.write(
    `错误: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
});
