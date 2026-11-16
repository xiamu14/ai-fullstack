import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { choice, integer } from './cli.js';
import { backendRoot, CommandFailure, run } from './process.js';

function command(
  name: string,
  args: string[] = [],
  env: NodeJS.ProcessEnv = {},
) {
  return spawnSync(
    'bun',
    [join(backendRoot, 'scripts', `${name}.ts`), ...args],
    {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: 10_000,
      env: { ...process.env, NO_COLOR: '1', CI: 'true', ...env },
    },
  );
}

describe('命令行边界', () => {
  it.each(['dev', 'deploy', 'test', 'db'])(
    '%s 帮助不验证环境或启动操作',
    (name) => {
      const result = command(name, ['--help'], {
        PORT: 'invalid',
        DATABASE_URL: 'invalid',
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`bun run ${name}`);
      expect(result.stdout).toContain('--interactive');
      expect(result.stdout).toContain('默认');
    },
  );

  it.each(['status', 'migrate', 'rollback', 'seed'])(
    'db %s 支持 -h',
    (action) => {
      const result = command('db', [action, '-h'], { DATABASE_URL: 'invalid' });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('数据库');
    },
  );

  it.each(['dev', 'deploy', 'test', 'db'])('%s 拒绝未知选项', (name) => {
    const result = command(name, ['--typo']);
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('--help');
  });

  it.each([
    ['dev', ['--port', '0']],
    ['deploy', ['--port', '65536']],
    ['test', ['--scope', 'missing']],
    ['test', ['--watch']],
    ['test', ['--scope', 'check', '--coverage']],
    ['db', ['missing']],
    ['db', ['status', '--steps', '1']],
    ['db', ['rollback', '--steps', '0']],
    ['db', ['migrate', 'seed']],
    ['db', ['seed']],
  ])('%s 拒绝非法参数组合 %j', (name, args) => {
    const result = command(name, args, {
      NODE_ENV: 'production',
      DATABASE_URL: 'invalid',
    });
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('--help');
  });

  it('非交互环境立即拒绝交互请求', () => {
    const result = command('dev', ['--interactive']);
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain('需要交互终端');
  });
});

describe('参数与子进程执行', () => {
  it.each(['0', '-1', '1.5', '1e3', '12abc', '', '9007199254740992'])(
    '拒绝非法整数 %s',
    (value) => {
      expect(() => integer(value, '--port')).toThrow();
    },
  );

  it('验证端口边界和枚举', () => {
    expect(integer('65535', '--port', 65535)).toBe(65535);
    expect(() => integer('65536', '--port', 65535)).toThrow();
    expect(choice('unit', ['unit', 'e2e'], '--scope')).toBe('unit');
    expect(() => choice('other', ['unit', 'e2e'], '--scope')).toThrow();
  });

  it('保留子进程失败退出码', async () => {
    await expect(run('node', ['-e', 'process.exit(7)'])).rejects.toMatchObject({
      exitCode: 7,
    });
  });

  it('参数中的 Shell 字符不会被执行', async () => {
    const value = 'space ; exit 42 # $(exit 43)';
    await expect(
      run('node', [
        '-e',
        `if (process.argv[1] !== ${JSON.stringify(value)}) process.exit(9)`,
        value,
      ]),
    ).resolves.toBeUndefined();
  });

  it('失败对象提供稳定退出码', () => {
    expect(new CommandFailure('cancelled', 130).exitCode).toBe(130);
  });
});
