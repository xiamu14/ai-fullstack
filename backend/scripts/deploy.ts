import { finish, integer, parseCommand, runCli, start } from './shared/cli.js';
import { booleanValue, textValue } from './shared/prompts.js';
import { run, runtimePath, tool } from './shared/process.js';

await runCli('deploy', async () => {
  const args = parseCommand({
    name: 'deploy',
    description:
      '本机生产运行：先构建，再以 NODE_ENV=production 启动 Node.js。',
    options: {
      port: {
        type: 'string',
        default: process.env.PORT ?? '3020',
        description: 'HTTP 端口，范围 1–65535；也可使用 PORT',
      },
      'build-only': {
        type: 'boolean',
        default: false,
        description: '只构建 dist，不启动服务',
      },
    },
    examples: [
      'bun run deploy',
      'bun run deploy --port 3001',
      'bun run deploy --build-only',
    ],
  });
  if (!args) return;
  let port = String(args.values.port);
  let buildOnly = args.values['build-only'] === true;
  if (args.interactive) {
    if (!args.provided.has('build-only'))
      buildOnly = await booleanValue('只构建产物？', buildOnly);
    if (!buildOnly && !args.provided.has('port'))
      port = await textValue('HTTP 端口', port);
  }
  const validatedPort = integer(port, '--port', 65535);
  start(
    buildOnly
      ? '构建生产产物'
      : `本机生产运行 · http://localhost:${validatedPort}`,
  );
  await tool('nest', ['build']);
  if (!buildOnly) {
    await run('node', [runtimePath('dist/main.js')], {
      NODE_ENV: 'production',
      PORT: String(validatedPort),
    });
  }
  finish(buildOnly ? '构建完成：dist/' : '生产服务已停止');
});
