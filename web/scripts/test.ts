import { log } from "@clack/prompts";
// biome-ignore lint/correctness/noUndeclaredDependencies: provided by @tanstack/react-start
import { Generator, getConfig } from "@tanstack/router-generator";
import { choice, finish, parseCommand, runCli, start } from "./shared/cli.js";
import { runtimePath, tool, webRoot } from "./shared/process.js";
import { booleanValue, selectValue } from "./shared/prompts.js";

const scopes = ["all", "check", "unit"] as const;
type TestScope = (typeof scopes)[number];

async function runTypeCheck(): Promise<void> {
  log.step("生成路由类型并执行类型检查");
  const routerConfig = getConfig(
    {
      target: "react",
      routesDirectory: runtimePath("src/routes"),
      generatedRouteTree: runtimePath("src/routeTree.gen.ts"),
      enableRouteTreeFormatting: false,
    },
    webRoot
  );
  await new Generator({ config: routerConfig, root: webRoot }).run();
  await tool("tsc", ["--project", "tsconfig.json", "--noEmit"]);
  await tool("tsc", ["--project", "scripts/tsconfig.json"]);
}

async function resolveOptions() {
  const args = parseCommand({
    name: "test",
    description: "类型检查与测试：默认运行类型检查和单元测试。",
    options: {
      scope: {
        type: "string",
        default: "all",
        description: "执行范围：all / check / unit",
      },
      watch: {
        type: "boolean",
        default: false,
        description: "监听测试变化，仅用于 unit",
      },
      coverage: {
        type: "boolean",
        default: false,
        description: "生成覆盖率报告，用于 all / unit",
      },
    },
    examples: [
      "bun run test",
      "bun run test --scope unit --watch",
      "bun run test --coverage",
      "bun run test --scope check",
    ],
  });
  if (!args) {
    return null;
  }

  let scope: TestScope = choice(args.values.scope, scopes, "--scope");
  let watch = args.values.watch === true;
  let coverage = args.values.coverage === true;

  if (args.interactive) {
    if (!args.provided.has("scope")) {
      scope = await selectValue("执行范围", scopes, scope);
    }
    if (scope === "unit" && !args.provided.has("watch")) {
      watch = await booleanValue("监听测试变化？", watch);
    }
    if (scope !== "check" && !args.provided.has("coverage")) {
      coverage = await booleanValue("生成覆盖率报告？", coverage);
    }
  }

  if (watch && scope !== "unit") {
    throw new Error("--watch 需要 --scope unit");
  }
  if (coverage && scope === "check") {
    throw new Error("--coverage 不能用于 --scope check");
  }

  return { scope, watch, coverage };
}

await runCli("test", async () => {
  const options = await resolveOptions();
  if (!options) {
    return;
  }

  const { scope, watch, coverage } = options;
  start(`类型检查与测试 · ${scope}`);

  if (scope === "all" || scope === "check") {
    await runTypeCheck();
  }
  if (scope === "all" || scope === "unit") {
    log.step("单元测试");
    await tool("vitest", [
      watch ? "watch" : "run",
      "--config",
      "vitest.config.ts",
      ...(coverage
        ? ["--coverage", "--coverage.reportsDirectory", "coverage/unit"]
        : []),
    ]);
  }
  finish("检查与测试完成");
});
