import { log } from '@clack/prompts';
import { probe, run, runtimePath } from './process.js';

const compose = ['compose', '--file', runtimePath('compose.yaml')];
const startupTimeout = 120;

async function check(args: string[], message: string): Promise<string> {
  const result = await probe('docker', args);
  if (result.exitCode !== 0) throw new Error(message);
  return result.stdout.trim();
}

export async function checkDocker(): Promise<void> {
  await check(['--version'], 'Docker CLI 不可用，请安装 Docker 后重试。');
  await check(
    ['compose', 'version'],
    'Docker Compose 不可用，请安装 Compose 插件后重试。',
  );
  await check(
    ['info', '--format', '{{.ServerVersion}}'],
    'Docker 引擎不可用，请手动启动 Docker，并检查当前 context 和访问权限后重试。',
  );
}

export function usesComposePostgres(connectionString?: string): boolean {
  if (!connectionString) return true;
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL 必须是 PostgreSQL 连接串');
  }
  return (
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname.toLowerCase()) &&
    (url.port || '5432') === (process.env.POSTGRES_PORT || '5432') &&
    decodeURIComponent(url.pathname.slice(1)) ===
      (process.env.POSTGRES_DB || 'backend')
  );
}

export async function ensurePostgres(): Promise<void> {
  log.step('检查 Docker 与本地 PostgreSQL 镜像');
  await checkDocker();
  const imageList = await check(
    [...compose, 'config', '--images', 'postgres'],
    '无法读取 PostgreSQL Compose 配置，请检查 compose.yaml 和环境变量。',
  );
  const images = imageList.split(/\r?\n/).filter(Boolean);
  if (images.length === 0) throw new Error('Compose 未配置 PostgreSQL 镜像。');
  for (const image of images) {
    await check(
      ['image', 'inspect', image],
      `本机缺少 ${image}，请先准备该镜像；开发脚本不会自动拉取。`,
    );
  }
  log.step('启动 PostgreSQL，等待健康检查通过');
  await run('docker', [
    ...compose,
    'up',
    '--detach',
    '--wait',
    '--wait-timeout',
    String(startupTimeout),
    '--pull',
    'never',
    '--no-deps',
    'postgres',
  ]);
  log.success('PostgreSQL 已就绪');
}
