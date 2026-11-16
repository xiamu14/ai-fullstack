import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { queryFigma } from "../bridge/client.ts";
import { DEFAULT_BRIDGE_PORT, startBridgeServer } from "../bridge/server.ts";
import { compactNode } from "../compact/node-compactor.ts";
import { compactLocalStyles } from "../compact/styles-compactor.ts";
import type {
  ExportedAssetItem,
  ExportFormat,
  LocalStylesSummary,
  SerializedNode,
} from "../protocol/types.ts";
import { buildFigmaPlugin } from "./build-plugin.ts";

export interface CliFlags {
  id?: string;
  query?: string;
  page?: string;
  filter?: string;
  depth?: number;
  css?: boolean;
  raw?: boolean;
  format?: ExportFormat;
  scale?: number;
  out?: string;
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

function sanitizeFileName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^\w\u4e00-\u9fa5.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "asset"
  );
}

export async function runDocumentCommand(flags: CliFlags): Promise<void> {
  const data = await queryFigma("document", {}, { port: flags.port });
  await emitJson(data, flags.out);
}

export async function runSelectionCommand(flags: CliFlags): Promise<void> {
  const data = await queryFigma<SerializedNode[]>(
    "selection",
    {
      depth: flags.depth ?? 2,
      includeCss: flags.css ?? false,
    },
    { port: flags.port }
  );
  const output = flags.raw
    ? data
    : data.map((n) => compactNode(n)).filter((n) => n !== null);
  await emitJson(output, flags.out);
}

export async function runNodeCommand(flags: CliFlags): Promise<void> {
  if (!flags.id) {
    throw new Error("读取指定节点需要提供 --id <nodeId>");
  }
  const data = await queryFigma<SerializedNode>(
    "node",
    {
      id: flags.id,
      depth: flags.depth ?? 2,
      includeCss: flags.css ?? false,
    },
    { port: flags.port }
  );
  const output = flags.raw ? data : compactNode(data);
  await emitJson(output, flags.out);
}

export async function runFindCommand(flags: CliFlags): Promise<void> {
  const query = flags.query ?? flags.filter;
  if (!query) {
    throw new Error("搜索节点需要提供 --query <关键词>（例如 --query colors/purple）");
  }
  const data = await queryFigma<SerializedNode[]>(
    "find",
    {
      query,
      page: flags.page,
      depth: flags.depth ?? 2,
      includeCss: flags.css ?? false,
    },
    { port: flags.port }
  );
  const output = flags.raw
    ? data
    : data.map((n) => compactNode(n)).filter((n) => n !== null);
  await emitJson(output, flags.out);
}

export async function runCssCommand(flags: CliFlags): Promise<void> {
  const data = await queryFigma(
    "css",
    { id: flags.id },
    {
      port: flags.port,
    }
  );
  await emitJson(data, flags.out);
}

export async function runStylesCommand(flags: CliFlags): Promise<void> {
  const data = await queryFigma<LocalStylesSummary>(
    "styles",
    {},
    {
      port: flags.port,
    }
  );
  const output = flags.raw ? data : compactLocalStyles(data, flags.filter);
  await emitJson(output, flags.out);
}

export async function runExportCommand(flags: CliFlags): Promise<void> {
  const format: ExportFormat = flags.format ?? "SVG";
  const items = await queryFigma<ExportedAssetItem[]>(
    "export",
    {
      id: flags.id,
      format,
      scale: flags.scale ?? 1,
    },
    { port: flags.port }
  );

  if (!flags.out) {
    await emitJson(items);
    return;
  }

  const outTarget = resolve(process.cwd(), flags.out);
  const ext = format.toLowerCase();

  if (items.length === 1 && outTarget.endsWith(`.${ext}`)) {
    const first = items[0];
    if (first) {
      await mkdir(dirname(outTarget), { recursive: true });
      await writeFile(outTarget, Buffer.from(first.base64, "base64"));
      process.stdout.write(`已导出资源: ${outTarget}\n`);
      return;
    }
  }

  await mkdir(outTarget, { recursive: true });
  for (const item of items) {
    const fileName = `${sanitizeFileName(item.name)}-${item.id.replace(":", "-")}.${ext}`;
    const filePath = resolve(outTarget, fileName);
    await writeFile(filePath, Buffer.from(item.base64, "base64"));
    process.stdout.write(`已导出资源: ${filePath}\n`);
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
