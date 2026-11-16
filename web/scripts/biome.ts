import { finish, parseCommand, runCli, start } from "./shared/cli.js";
import { tool } from "./shared/process.js";
import { booleanValue } from "./shared/prompts.js";

await runCli("biome", async () => {
  const args = parseCommand({
    name: "biome",
    description:
      "Biome 代码检查与格式化：默认执行检查并自动修复可安全修复的问题，加 --check 仅检查不写入。",
    options: {
      check: {
        type: "boolean",
        default: false,
        description: "只检查，不写入修复与格式化结果",
      },
      unsafe: {
        type: "boolean",
        default: false,
        description: "启用 unsafe 自动修复（不能与 --check 同用）",
      },
    },
    examples: [
      "bun run biome",
      "bun run biome --check",
      "bun run biome --unsafe",
      "bun run biome --interactive",
    ],
  });
  if (!args) {
    return;
  }

  let checkOnly = args.values.check === true;
  let unsafe = args.values.unsafe === true;
  if (args.interactive) {
    if (!args.provided.has("check")) {
      checkOnly = await booleanValue("仅检查（不写入修改）？", checkOnly);
    }
    if (!(checkOnly || args.provided.has("unsafe"))) {
      unsafe = await booleanValue("启用 unsafe 自动修复？", unsafe);
    }
  }
  if (unsafe && checkOnly) {
    throw new Error("--unsafe 不能与 --check 同时使用");
  }

  start(checkOnly ? "Biome 检查" : "Biome 检查与格式化");
  await tool("biome", [
    "check",
    ...(checkOnly ? [] : ["--write"]),
    ...(unsafe ? ["--unsafe"] : []),
    "src",
    "scripts",
    "biome.jsonc",
    "package.json",
  ]);
  finish(checkOnly ? "Biome 检查通过" : "Biome 检查与格式化完成");
});
