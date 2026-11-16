import { finish, integer, parseCommand, runCli, start } from "./shared/cli.js";
import { tool } from "./shared/process.js";
import { booleanValue, textValue } from "./shared/prompts.js";

await runCli("deploy", async () => {
  const args = parseCommand({
    name: "deploy",
    description:
      "本机生产运行：先构建 TanStack Start SPA 产物，再以生产预览模式启动。",
    options: {
      port: {
        type: "string",
        default: process.env.PORT ?? "4173",
        description: "HTTP 端口，范围 1–65535；也可使用 PORT",
      },
      "build-only": {
        type: "boolean",
        default: false,
        description: "只构建产物，不启动服务",
      },
    },
    examples: [
      "bun run deploy",
      "bun run deploy --port 4173",
      "bun run deploy --build-only",
    ],
  });
  if (!args) {
    return;
  }
  let port = String(args.values.port);
  let buildOnly = args.values["build-only"] === true;
  if (args.interactive) {
    if (!args.provided.has("build-only")) {
      buildOnly = await booleanValue("只构建产物？", buildOnly);
    }
    if (!(buildOnly || args.provided.has("port"))) {
      port = await textValue("HTTP 端口", port);
    }
  }
  const validatedPort = integer(port, "--port", 65_535);
  start(
    buildOnly
      ? "构建生产产物"
      : `本机生产运行 · http://localhost:${validatedPort}`
  );
  await tool("vite", ["build"], { NODE_ENV: "production" });
  if (!buildOnly) {
    await tool(
      "vite",
      ["preview", "--port", String(validatedPort), "--strictPort"],
      {
        NODE_ENV: "production",
        PORT: String(validatedPort),
      }
    );
  }
  finish(buildOnly ? "构建完成：dist/" : "生产服务已停止");
});
