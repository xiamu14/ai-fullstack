import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { questionSchema, gradingPolicy } from '../src/domain/question'
import { callJev } from '../src/server/jev'
import { summarize } from '../src/domain/grading'
import { calibrate, metrics, type Sample } from './evaluation-metrics'
const root = new URL('../content/', import.meta.url)
const stamp = new Date().toISOString().replaceAll(':', '-')
const output = new URL(`../reports/${stamp}/`, import.meta.url)
await mkdir(output, { recursive: true })
const caseSchema = z.object({
  questionId: z.string(),
  split: z.enum(['development', 'holdout']),
  cases: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      answer: z.string().min(1),
      expected: z.array(z.number().min(0).max(4)),
      critical: z.boolean(),
    }),
  ),
})
const samples: Sample[] = []
const files = (await readdir(new URL('evaluation/', root)))
  .filter((f) => f.endsWith('.json'))
  .sort()
for (const file of files) {
  const group = caseSchema.parse(
    JSON.parse(await readFile(new URL(`evaluation/${file}`, root), 'utf8')),
  )
  const question = questionSchema.parse(
    JSON.parse(await readFile(new URL(`questions/${group.questionId}.json`, root), 'utf8')),
  )
  for (const c of group.cases) {
    if (c.expected.length !== question.rubric.length) throw new Error(`${c.id} 的标签数量不匹配`)
    samples.push({ ...c, question, split: group.split, raw: null })
  }
}
await writeFile(
  new URL('manifest.json', output),
  JSON.stringify(
    {
      model: gradingPolicy.model,
      policy: gradingPolicy.version,
      questionVersions: Object.fromEntries(samples.map((s) => [s.question.id, s.question.version])),
      fingerprint: createHash('sha256').update(JSON.stringify(samples)).digest('hex'),
      note: '初始标签由整理者制定，尚待用户独立复核；同题不跨集合。',
    },
    null,
    2,
  ),
)
for (let offset = 0; offset < samples.length; offset += 4) {
  await Promise.all(
    samples.slice(offset, offset + 4).map(async (sample) => {
      sample.raw = await callJev(sample.question, sample.answer)
      await writeFile(new URL(`${sample.id}.json`, output), JSON.stringify(sample, null, 2))
      console.log(`${sample.id} 已评测`)
    }),
  )
}
if (new Set(samples.map((s) => (s.raw as { model: string }).model)).size !== 1)
  throw new Error('评测中出现不同模型快照，请检查原始记录')
const development = samples.filter((s) => s.split === 'development')
const holdout = samples.filter((s) => s.split === 'holdout')
const config = calibrate(development, gradingPolicy.model, gradingPolicy.version)
const developmentReport = metrics(development, config)
const holdoutReport = metrics(holdout, config)
const repeatSeeds = [
  ...development.filter((s) => s.kind === 'partial').slice(0, 5),
  ...holdout.filter((s) => s.kind === 'partial').slice(0, 5),
]
const repeats = []
for (const sample of repeatSeeds) {
  const values = []
  for (let i = 0; i < 3; i++) {
    const raw = await callJev(sample.question, sample.answer)
    await writeFile(
      new URL(`${sample.id}-repeat-${i + 1}.json`, output),
      JSON.stringify(raw, null, 2),
    )
    values.push(summarize(sample.question, raw, config).score)
  }
  const valid = values.filter((v) => v !== null)
  repeats.push({
    id: sample.id,
    values,
    range: valid.length === 3 ? Math.max(...valid) - Math.min(...valid) : null,
  })
  console.log(`${sample.id} 重复评测已完成`)
}
const repeatPassed = repeats.every((r) => r.range !== null && r.range <= 5)
const passed = developmentReport.passed && holdoutReport.passed && repeatPassed
const report = {
  passed,
  config,
  development: developmentReport,
  holdout: holdoutReport,
  repeats,
  repeatPassed,
}
await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2))
await writeFile(
  new URL('report.md', output),
  `# Jev 评分验证\n\n模型：${gradingPolicy.model}。初始标签由整理者制定，待用户复核。\n\n|集合|样本|确定结果|MAE|关键错误漏报|误报|注入失败|\n|---|---|---|---|---|---|---|\n${[developmentReport, holdoutReport].map((r, i) => `|${i ? '留出' : '开发'}|${r.count}|${r.scored}/${r.count}|${r.mae?.toFixed(2)}|${r.criticalMisses}|${r.falseCritical}|${r.injectionFailures}|`).join('\n')}\n\n重复测量：${repeats.length} 份 × 3 次，${repeatPassed ? '通过' : '未通过'}。\n总体验收：${passed ? '通过' : '未通过'}。\n阈值只根据开发集选择，未根据留出集调整。\n`,
)
console.log(
  JSON.stringify({
    passed,
    output: output.pathname,
    development: { mae: developmentReport.mae, coverage: developmentReport.coverage },
    holdout: { mae: holdoutReport.mae, coverage: holdoutReport.coverage },
    repeats,
  }),
)
if (!passed) throw new Error('验证未通过；未启用该评分配置，详见报告')
await writeFile(
  new URL('calibration.json', root),
  JSON.stringify(
    {
      ...config,
      validatedSnapshot: (samples[0].raw as { model: string }).model,
      validatedAt: new Date().toISOString(),
      report: `reports/${stamp}`,
    },
    null,
    2,
  ),
)
