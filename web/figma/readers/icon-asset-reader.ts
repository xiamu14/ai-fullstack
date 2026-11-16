import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { queryFigma } from "../bridge/client.ts";
import { svgToReactComponent } from "../compact/icon-react-compact.ts";
import { compactSvg } from "../compact/icon-svg-compact.ts";
import type { ExportedAssetItem, ExportFormat } from "../protocol/types.ts";

export interface ExportIconAssetsOptions {
  id?: string;
  query?: string;
  page?: string;
  format?: ExportFormat;
  scale?: number;
  raw?: boolean;
  out?: string;
  reactOut?: string;
  port?: number;
}

export interface ExportIconAssetsResult {
  items: ExportedAssetItem[];
  savedFiles: string[];
  savedReactComponents: Array<{
    componentName: string;
    filePath: string;
  }>;
}

function sanitizeFileName(name: string): string {
  const leaf = name.split("/").pop()?.trim() ?? name.trim();
  return (
    leaf
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "asset"
  );
}

export async function fetchAndExportIconAssets(
  options: ExportIconAssetsOptions
): Promise<ExportIconAssetsResult> {
  const format: ExportFormat = options.format ?? "SVG";
  const items = await queryFigma<ExportedAssetItem[]>(
    "export",
    {
      id: options.id,
      query: options.query,
      page: options.page,
      format,
      scale: options.scale ?? 1,
    },
    { port: options.port }
  );

  const savedFiles: string[] = [];
  const savedReactComponents: Array<{
    componentName: string;
    filePath: string;
  }> = [];

  const ext = format.toLowerCase();

  if (options.out) {
    const outTarget = resolve(process.cwd(), options.out);
    if (items.length === 1 && outTarget.endsWith(`.${ext}`)) {
      const first = items[0];
      if (first) {
        await mkdir(dirname(outTarget), { recursive: true });
        const rawBytes = Buffer.from(first.base64, "base64");
        const content =
          format === "SVG" && !options.raw
            ? compactSvg(rawBytes.toString("utf8"))
            : rawBytes;
        await writeFile(outTarget, content);
        savedFiles.push(outTarget);
      }
    } else {
      await mkdir(outTarget, { recursive: true });
      for (const item of items) {
        const fileName = `${sanitizeFileName(item.name)}.${ext}`;
        const filePath = resolve(outTarget, fileName);
        const rawBytes = Buffer.from(item.base64, "base64");
        const content =
          format === "SVG" && !options.raw
            ? compactSvg(rawBytes.toString("utf8"))
            : rawBytes;
        await writeFile(filePath, content);
        savedFiles.push(filePath);
      }
    }
  }

  if (options.reactOut) {
    if (format !== "SVG") {
      throw new Error("--react-out 仅支持与 SVG 导出格式配合使用");
    }
    const reactTarget = resolve(process.cwd(), options.reactOut);
    for (const item of items) {
      const rawSvg = Buffer.from(item.base64, "base64").toString("utf8");
      const { kebabFileName, componentName, code } = svgToReactComponent(
        rawSvg,
        item.name
      );
      const filePath = reactTarget.endsWith(".tsx")
        ? reactTarget
        : resolve(reactTarget, `${kebabFileName}.tsx`);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, code, "utf8");
      savedReactComponents.push({ componentName, filePath });
    }
  }

  return {
    items,
    savedFiles,
    savedReactComponents,
  };
}
