import { log } from '@clack/prompts';
import { choice, finish, parseCommand, runCli, start } from './shared/cli.js';
import { booleanValue, selectValue } from './shared/prompts.js';
import { tool } from './shared/process.js';

const scopes = ['all', 'check', 'unit', 'e2e'] as const;

await runCli('test', async () => {
  const args = parseCommand({
    name: 'test',
    description: '类型检查与测试：默认运行类型检查、单元测试和端到端测试。',
    options: {
      scope: {
        type: 'string',
        default: 'all',
        description: '执行范围：all / check / unit / e2e',
      },
      watch: {
        type: 'boolean',
        default: false,
        description: '监听测试变化，仅用于 unit / e2e',
      },
      coverage: {
        type: 'boolean',
        default: false,
        description: '生成覆盖率报告，用于 all / unit / e2e',
      },
    },
    examples: [
      'bun run test',
      'bun run test --scope unit --watch',
      'bun run test --coverage',
      'bun run test --scope check',
    ],
  });
  if (!args) return;
  let scope = choice(args.values.scope, scopes, '--scope');
  let watch = args.values.watch === true;
  let coverage = args.values.coverage === true;
  if (args.interactive) {
    if (!args.provided.has('scope'))
      scope = await selectValue('执行范围', scopes, scope);
    if (scope === 'unit' || scope === 'e2e') {
      if (!args.provided.has('watch'))
        watch = await booleanValue('监听测试变化？', watch);
    }
    if (scope !== 'check' && !args.provided.has('coverage'))
      coverage = await booleanValue('生成覆盖率报告？', coverage);
  }
  if (watch && (scope === 'all' || scope === 'check'))
    throw new Error('--watch 需要 --scope unit 或 --scope e2e');
  if (coverage && scope === 'check')
    throw new Error('--coverage 不能用于 --scope check');
  start(`类型检查与测试 · ${scope}`);
  if (scope === 'all' || scope === 'check') {
    log.step('类型检查');
    await tool('tsc', [
      '--project',
      'tsconfig.json',
      '--noEmit',
      '--incremental',
      'false',
    ]);
    await tool('tsc', ['--project', 'scripts/tsconfig.json']);
  }
  for (const suite of ['unit', 'e2e'] as const) {
    if (scope !== 'all' && scope !== suite) continue;
    log.step(suite === 'unit' ? '单元测试' : '端到端测试');
    await tool('vitest', [
      watch ? 'watch' : 'run',
      '--config',
      suite === 'unit' ? 'vitest.config.ts' : 'vitest.config.e2e.ts',
      ...(coverage
        ? ['--coverage', '--coverage.reportsDirectory', `coverage/${suite}`]
        : []),
    ]);
  }
  finish('检查与测试完成');
});
