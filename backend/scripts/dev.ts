import { finish, integer, parseCommand, runCli, start } from './shared/cli.js';
import { ensurePostgres, usesComposePostgres } from './shared/docker.js';
import { booleanValue, textValue } from './shared/prompts.js';
import { tool } from './shared/process.js';

await runCli('dev', async () => {
  const args = parseCommand({
    name: 'dev',
    description:
      '本地开发：检查 Docker，启动本地 Compose PostgreSQL 并等待就绪，再监听启动 NestJS。\nDocker 引擎不可用时直接退出，不尝试启动 Docker Desktop；数据库就绪最多等待 120 秒。\n请先配置 .env 和执行所需迁移。',
    options: {
      'skip-docker': {
        type: 'boolean',
        default: false,
        description: '跳过 Docker，使用已有数据库；外部数据库自动跳过',
      },
      port: {
        type: 'string',
        default: process.env.PORT ?? '3020',
        description: 'HTTP 端口，范围 1–65535；也可使用 PORT',
      },
      debug: {
        type: 'boolean',
        default: false,
        description: '开启 Node.js 调试器（127.0.0.1:9229）',
      },
    },
    examples: [
      'bun run dev',
      'bun run dev --port 3001 --debug',
      'bun run dev --skip-docker',
      'bun run dev --interactive',
    ],
  });
  if (!args) return;
  let port = String(args.values.port);
  let debug = args.values.debug === true;
  if (args.interactive) {
    if (!args.provided.has('port')) port = await textValue('HTTP 端口', port);
    if (!args.provided.has('debug'))
      debug = await booleanValue('开启调试器？', debug);
  }
  const validatedPort = integer(port, '--port', 65535);
  const manageDocker =
    args.values['skip-docker'] !== true &&
    usesComposePostgres(process.env.DATABASE_URL);
  start(`本地开发 · http://localhost:${validatedPort}`);
  if (manageDocker) await ensurePostgres();
  await tool(
    'nest',
    ['start', '--watch', ...(debug ? ['--debug', '127.0.0.1:9229'] : [])],
    {
      NODE_ENV: 'development',
      PORT: String(validatedPort),
    },
  );
  finish('开发服务已停止');
});
