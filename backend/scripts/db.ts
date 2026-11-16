import { log } from '@clack/prompts';
import {
  choice,
  finish,
  integer,
  parseCommand,
  runCli,
  start,
} from './shared/cli.js';
import { ensurePostgres, usesComposePostgres } from './shared/docker.js';
import { selectValue, textValue } from './shared/prompts.js';

const actions = ['status', 'migrate', 'rollback', 'seed'] as const;

await runCli('db', async () => {
  const args = parseCommand({
    name: 'db',
    description:
      'PostgreSQL 数据库工具。默认 status，只查看连接与迁移状态。\n\n子命令:\n  status    查看已应用、待应用和缺失的迁移\n  migrate   应用全部待执行迁移\n  rollback  回滚最近的迁移，默认一步\n  seed      按文件名顺序执行开发种子 SQL\n\n连接: DATABASE_URL，默认 postgresql://postgres:postgres@127.0.0.1:5432/backend\n开发环境的写入命令会检查 Docker 并启动本地 Compose PostgreSQL，最多等待 120 秒。\nstatus、生产环境和外部数据库不启动容器；Docker 不可用时直接报错，不启动 Docker Desktop。',
    positional: '[status|migrate|rollback|seed]',
    options: {
      'skip-docker': {
        type: 'boolean',
        default: false,
        description: '跳过本地 PostgreSQL 容器启动，直接使用 DATABASE_URL',
      },
      steps: {
        type: 'string',
        default: '1',
        description: '回滚步数，仅用于 rollback',
      },
    },
    examples: [
      'bun run db',
      'bun run db migrate',
      'bun run db migrate --skip-docker',
      'bun run db rollback --steps 1',
      'bun run db seed',
      'bun run db migrate --help',
    ],
  });
  if (!args) return;
  if (args.positionals.length > 1) throw new Error('db 只能指定一个子命令');
  let action = choice(args.positionals[0] ?? 'status', actions, 'db 子命令');
  let steps = String(args.values.steps);
  if (args.interactive) {
    if (args.positionals.length === 0)
      action = await selectValue('数据库操作', actions, action);
    if (action === 'rollback' && !args.provided.has('steps'))
      steps = await textValue('回滚步数', steps);
  }
  if (action !== 'rollback' && args.provided.has('steps'))
    throw new Error('--steps 仅用于 db rollback');
  const count = integer(steps, '--steps');
  if (action === 'seed' && process.env.NODE_ENV === 'production')
    throw new Error('db seed 仅用于开发环境');
  const { databaseConfig, withDatabase } = await import('./db/connection.js');
  const { migrationStatus, migrate } = await import('./db/migrations.js');
  const { seed } = await import('./db/seed.js');
  const config = databaseConfig();
  start(`数据库 · ${action}`);
  if (
    action !== 'status' &&
    process.env.NODE_ENV !== 'production' &&
    args.values['skip-docker'] !== true &&
    usesComposePostgres(config.connectionString)
  ) {
    await ensurePostgres();
  }
  await withDatabase(config, async (client) => {
    if (action === 'status') {
      const status = await migrationStatus(client, config.migrationsDir);
      log.info(
        `数据库连接正常；已应用 ${status.filter((item) => item.status === 'applied').length}，待应用 ${status.filter((item) => item.status === 'pending').length}，缺失 ${status.filter((item) => item.status === 'missing').length}`,
      );
      for (const item of status)
        log.info(`${item.status.padEnd(8)} ${item.name}`);
    } else if (action === 'seed') {
      log.success(`已执行 ${await seed(client, config.seedsDir)} 个种子文件`);
    } else {
      const completed = await migrate(
        client,
        config.migrationsDir,
        action === 'migrate' ? 'up' : 'down',
        count,
      );
      log.success(
        `已${action === 'migrate' ? '应用' : '回滚'} ${completed} 个迁移`,
      );
    }
  });
  finish('数据库操作完成');
});
