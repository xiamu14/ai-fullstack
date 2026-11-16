import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

export async function buildFigmaPlugin(): Promise<string> {
  const pluginDir = resolve(import.meta.dirname, "../plugin");
  const webRoot = resolve(pluginDir, "../..");
  const cssBuild = await build({
    root: webRoot,
    configFile: false,
    plugins: [tailwindcss()],
    build: {
      write: false,
      cssMinify: true,
      rollupOptions: { input: resolve(webRoot, "src/styles.css") },
    },
  });
  const cssOutputs = Array.isArray(cssBuild) ? cssBuild : [cssBuild];
  const css = cssOutputs.flatMap((output) => "output" in output ? output.output : [])
    .filter((asset) => asset.type === "asset" && asset.fileName.endsWith(".css"))
    .map((asset) => asset.type === "asset" ? String(asset.source) : "").join("\n");
  if (!css) throw new Error("未生成插件 Tailwind 样式");
  const uiBuild = await Bun.build({
    entrypoints: [resolve(pluginDir, "ui.ts")],
    target: "browser",
    format: "iife",
    minify: true,
  });
  if (!uiBuild.success) throw new Error(uiBuild.logs.map((log) => log.message).join("\n"));
  const script = await uiBuild.outputs[0]!.text();
  const html = (await readFile(resolve(pluginDir, "ui.html"), "utf8"))
    .replace('<link id="plugin-styles" rel="stylesheet" href="/src/styles.css">', `<style>${css}</style>`)
    .replace('<script type="module" src="./ui.ts"></script>', `<script>${script.replaceAll("</script", "<\\/script")}</script>`);
  const result = await Bun.build({
    entrypoints: [resolve(pluginDir, "code.ts")],
    outdir: pluginDir,
    target: "browser",
    format: "iife",
    naming: "code.js",
    define: { __html__: JSON.stringify(html) },
    minify: true,
  });
  if (!result.success) throw new Error(result.logs.map((log) => log.message).join("\n"));
  return resolve(pluginDir, "code.js");
}
