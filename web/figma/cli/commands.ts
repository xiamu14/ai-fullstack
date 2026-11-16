import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { DEFAULT_BRIDGE_PORT, startBridgeServer } from "../bridge/server.ts";
import type { ExportFormat } from "../protocol/types.ts";
import { fetchLocalStyles } from "../readers/color-style-reader.ts";
import {
  fetchMatchingNodes,
  fetchNodeById,
  fetchNodeCss,
  fetchSelectionNodes,
} from "../readers/component-node-reader.ts";
import { fetchDocumentSummary } from "../readers/document-reader.ts";
import { fetchAndExportIconAssets } from "../readers/icon-asset-reader.ts";
import { fetchTypographyStyles } from "../readers/typography-reader.ts";
import { buildFigmaPlugin } from "./build-plugin.ts";

export interface CliFlags {
  id?: string;
  query?: string;
  page?: string;
  filter?: string;
  depth?: number;
  css?: boolean;
  raw?: boolean;
  refresh?: boolean;
  format?: ExportFormat;
  scale?: number;
  out?: string;
  reactOut?: string;
  port?: number;
}

async function emitJson(data: unknown, outPath?: string): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (outPath) {
    const absPath = resolve(process.cwd(), outPath);
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, `${json}\n`, "utf8");
    process.stdout.write(`已保存至 ${absPath}\n`);
    return;
  }
  process.stdout.write(`${json}\n`);
}

export async function runDocumentCommand(flags: CliFlags): Promise<void> {
  const data = await fetchDocumentSummary({ port: flags.port });
  await emitJson(data, flags.out);
}

export async function runSelectionCommand(flags: CliFlags): Promise<void> {
  const output = await fetchSelectionNodes({
    depth: flags.depth,
    includeCss: flags.css,
    raw: flags.raw,
    port: flags.port,
  });
  await emitJson(output, flags.out);
}

export async function runNodeCommand(flags: CliFlags): Promise<void> {
  if (!flags.id) {
    throw new Error("读取指定节点需要提供 --id <nodeId>");
  }
  const output = await fetchNodeById({
    id: flags.id,
    depth: flags.depth,
    includeCss: flags.css,
    raw: flags.raw,
    port: flags.port,
  });
  await emitJson(output, flags.out);
}

export async function runFindCommand(flags: CliFlags): Promise<void> {
  const query = flags.query ?? flags.filter;
  if (!query) {
    throw new Error(
      "搜索节点需要提供 --query <关键词>（例如 --query colors/purple）"
    );
  }
  const output = await fetchMatchingNodes({
    query,
    page: flags.page,
    depth: flags.depth,
    includeCss: flags.css,
    raw: flags.raw,
    port: flags.port,
  });
  await emitJson(output, flags.out);
}

export async function runCssCommand(flags: CliFlags): Promise<void> {
  const data = await fetchNodeCss({ id: flags.id, port: flags.port });
  await emitJson(data, flags.out);
}

export async function runStylesCommand(flags: CliFlags): Promise<void> {
  const output = await fetchLocalStyles({
    filter: flags.filter,
    raw: flags.raw,
    refresh: flags.refresh,
    port: flags.port,
  });
  await emitJson(output, flags.out);
}

export async function runTypographyCommand(flags: CliFlags): Promise<void> {
  const output = await fetchTypographyStyles({
    filter: flags.filter,
    raw: flags.raw,
    refresh: flags.refresh,
    port: flags.port,
  });
  await emitJson(output, flags.out);
}

export async function runExportCommand(flags: CliFlags): Promise<void> {
  const result = await fetchAndExportIconAssets({
    id: flags.id,
    query: flags.query ?? flags.filter,
    page: flags.page,
    format: flags.format,
    scale: flags.scale,
    raw: flags.raw,
    out: flags.out,
    reactOut: flags.reactOut,
    port: flags.port,
  });

  if (!flags.out && !flags.reactOut) {
    await emitJson(result.items);
    return;
  }

  for (const filePath of result.savedFiles) {
    process.stdout.write(`已导出资源: ${filePath}\n`);
  }
  for (const comp of result.savedReactComponents) {
    process.stdout.write(
      `已导出 React 图标组件 (${comp.componentName}): ${comp.filePath}\n`
    );
  }
}

export async function runServeCommand(flags: CliFlags): Promise<void> {
  const port = flags.port ?? DEFAULT_BRIDGE_PORT;
  const hub = startBridgeServer(port);
  process.stdout.write(
    `Figma 本地只读桥接服务已启动: ws://localhost:${hub.port}/ws (按 Ctrl+C 停止)\n`
  );
  await new Promise<void>((resolvePromise) => {
    process.once("SIGINT", () => {
      hub.stop();
      resolvePromise();
    });
    process.once("SIGTERM", () => {
      hub.stop();
      resolvePromise();
    });
  });
}

export async function runBuildPluginCommand(): Promise<void> {
  const outPath = await buildFigmaPlugin();
  process.stdout.write(`已生成 Figma 插件脚本: ${outPath}\n`);
}
