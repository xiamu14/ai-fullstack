import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { calibrationSchema, summarize } from '../../src/domain/grading'
import { questionSchema } from '../../src/domain/question'
import { callJev } from '../../src/server/jev'
import { metrics, type Sample } from '../evaluation-metrics'

const root = new URL('../../', import.meta.url)
const batch = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .parse(process.argv[2] ?? 'question-expansion-2026-10-24')
const output = new URL(`reports/${batch}/`, root)
const json = async (path: URL) => JSON.parse(await readFile(path, 'utf8'))
const manifest = z
  .object({ questionIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1) })
  .parse(await json(new URL(`content/${batch}.json`, root)))
if (new Set(manifest.questionIds).size !== manifest.questionIds.length)
  throw new Error('批次题目 ID 重复')
const calibrationInput = await json(new URL('content/calibration.json', root))
const calibration = calibrationSchema.parse(calibrationInput)
const snapshot = z.string().min(1).parse(calibrationInput.validatedSnapshot)
const fixtureSchema = z.object({
  questionId: z.string(),
  split: z.literal('holdout'),
  cases: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        kind: z.string(),
        answer: z.string().min(1),
        expected: z.array(z.number().int().min(0).max(4)),
        critical: z.boolean(),
      }),
    )
    .length(5),
})
const journalSchema = z.object({
  fingerprint: z.string(),
  status: z.enum(['started', 'completed', 'failed']),
  raw: z.unknown().optional(),
  error: z.string().optional(),
})
await mkdir(output, { recursive: true })
const groups = await Promise.all(
  manifest.questionIds.map(async (id) => {
    const path = new URL(`content/questions/${id}.json`, root)
    const question = questionSchema.parse(await json(path))
    const fixture = fixtureSchema.parse(await json(new URL(`content/evaluation/${id}.json`, root)))
    if (question.id !== id || fixture.questionId !== id) throw new Error(`${id} 的 ID 不一致`)
    const samples: Sample[] = fixture.cases.map((c) => {
      if (c.expected.length !== question.rubric.length) throw new Error(`${c.id} 标签数量错误`)
      return { ...c, question, split: fixture.split, raw: null }
    })
    return { path, question, samples, errors: [] as string[] }
  }),
)
const all = groups.flatMap((group) => group.samples.map((sample) => ({ group, sample })))
if (new Set(all.map(({ sample }) => sample.id)).size !== all.length) throw new Error('样本 ID 重复')
for (let offset = 0; offset < all.length; offset += 4) {
  await Promise.all(
    all.slice(offset, offset + 4).map(async ({ group, sample }) => {
      const path = new URL(`${sample.id}.json`, output)
      const fingerprint = createHash('sha256')
        .update(
          JSON.stringify({
            ...sample,
            // Provenance edits do not change the data sent to the grader.
            question: {
              prompt: sample.question.prompt,
              reference: sample.question.reference,
              rubric: sample.question.rubric,
              criticalError: sample.question.criticalError,
            },
            calibration,
            snapshot,
          }),
        )
        .digest('hex')
      let journal: z.infer<typeof journalSchema>
      try {
        journal = journalSchema.parse(await json(path))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        journal = { fingerprint, status: 'started' }
        // Persist before sending: interrupted or failed requests are never automatically repeated.
        await writeFile(path, JSON.stringify(journal, null, 2), { flag: 'wx' })
        try {
          const raw = await callJev(sample.question, sample.answer)
          journal.raw = raw
          if ((raw as { model?: string }).model !== snapshot)
            throw new Error('模型快照与已验证配置不同')
          summarize(sample.question, raw, calibration)
          journal.status = 'completed'
        } catch (error) {
          journal.status = 'failed'
          journal.error = error instanceof Error ? error.message : String(error)
        }
        await writeFile(path, JSON.stringify(journal, null, 2))
      }
      if (journal.fingerprint !== fingerprint)
        throw new Error(`${sample.id} 已请求，内容改变，不会重试`)
      if (journal.status === 'completed') sample.raw = journal.raw
      else group.errors.push(`${sample.id}: ${journal.error ?? '已发起但未取得结果，不重试'}`)
    }),
  )
  console.log(`${batch}: 已记录 ${Math.min(offset + 4, all.length)}/${all.length} 份答题评测`)
}
const reports = []
for (const group of groups) {
  const valid = group.samples.filter((sample) => sample.raw !== null)
  const result = valid.length ? metrics(valid, calibration) : null
  const passed = !group.errors.length && result?.passed === true
  if (passed && group.question.review !== 'reviewed') {
    group.question.review = 'reviewed'
    await writeFile(group.path, `${JSON.stringify(group.question, null, 2)}\n`)
  }
  reports.push({ id: group.question.id, passed, errors: group.errors, result })
}
const combined = metrics(
  all.map(({ sample }) => sample).filter((s) => s.raw !== null),
  calibration,
)
const report = {
  snapshot,
  calibration,
  passed: reports.every((r) => r.passed),
  requested: all.length,
  approved: reports.filter((r) => r.passed).length,
  combined,
  questions: reports,
  note: '仅答题评分验证；正文判定未重跑。标签由整理者制定，待独立人工复核。固定既有阈值，不重试、不重新校准。',
}
await writeFile(new URL('report.json', output), `${JSON.stringify(report, null, 2)}\n`)
console.log(
  JSON.stringify({
    passed: report.passed,
    approved: report.approved,
    total: groups.length,
    mae: combined.mae,
    coverage: combined.coverage,
    output: output.pathname,
  }),
)
if (!report.passed) process.exitCode = 1
