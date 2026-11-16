import { resolve } from "node:path";

export async function buildFigmaPlugin(): Promise<string> {
  const pluginDir = resolve(import.meta.dirname, "../plugin");
  const entryPath = resolve(pluginDir, "code.ts");
  const outPath = resolve(pluginDir, "code.js");

  const result = await Bun.build({
    entrypoints: [entryPath],
    outdir: pluginDir,
    target: "browser",
    format: "iife",
    naming: "code.js",
    minify: false,
  });

  if (!result.success) {
    const messages = result.logs.map((log) => log.message).join("\n");
    throw new Error(`编译 Figma 插件失败:\n${messages}`);
  }

  return outPath;
}
