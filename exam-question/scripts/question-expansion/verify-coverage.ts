import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { z } from 'zod'
import { questionSchema } from '../../src/domain/question'
import { db } from '../../src/server/db'
import { catalog } from '../../src/server/questions'

const root = new URL('../../', import.meta.url)
const json = async (path: string) => JSON.parse(await readFile(new URL(path, root), 'utf8'))
const entries = z
  .array(
    z.object({
      sourceId: z.string().min(1),
      bodyHash: z.string().regex(/^[a-f0-9]{64}$/),
      questionIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
    }),
  )
  .min(1)
  .parse(await json('content/source-coverage.json'))
assert.equal(new Set(entries.map((e) => e.sourceId)).size, entries.length, '来源清单重复')
const batchManifest = z
  .object({ batches: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1) })
  .parse(await json('content/question-completion-2026-10-24.json'))
const batchResults = []
const newQuestionIds: string[] = []
for (const batch of batchManifest.batches) {
  const report = await json(`reports/${batch}/report.json`)
  const manifest = z
    .object({ questionIds: z.array(z.string()).min(1) })
    .parse(await json(`content/${batch}.json`))
  assert.equal(report.passed, true, `${batch} 评分未通过`)
  assert.equal(report.approved, manifest.questionIds.length)
  assert.equal(report.questions.length, manifest.questionIds.length)
  for (const id of manifest.questionIds)
    assert.ok(
      report.questions.some((q: { id: string; passed: boolean }) => q.id === id && q.passed),
    )
  newQuestionIds.push(...manifest.questionIds)
  batchResults.push({
    batch,
    questions: report.approved,
    samples: report.combined.count,
    scored: report.combined.scored,
    mae: report.combined.mae,
  })
}
assert.equal(new Set(newQuestionIds).size, newQuestionIds.length, '新增题目重复')
const sql = db()
try {
  const [sources, rows, list] = await Promise.all([
    sql`SELECT id,content FROM sources WHERE library_id='ai-agents' ORDER BY id`,
    sql`SELECT id,content FROM questions WHERE library_id='ai-agents' ORDER BY id`,
    catalog(),
  ])
  assert.deepEqual(
    entries.map((e) => e.sourceId).sort(),
    sources.map((s) => s.id).sort(),
    '存在未整理的正文或多余清单项',
  )
  const questions = new Map(rows.map((r) => [r.id, questionSchema.parse(r.content)]))
  const bySource = new Map(sources.map((s) => [s.id, s.content]))
  for (const entry of entries) {
    const source = bySource.get(entry.sourceId)!
    assert.equal(
      createHash('sha256').update(source.evidence).digest('hex'),
      entry.bodyHash,
      `${entry.sourceId} 正文改变`,
    )
    assert.equal(new Set(entry.questionIds).size, entry.questionIds.length)
    for (const id of entry.questionIds) {
      const q = questions.get(id)
      assert.ok(q, `${entry.sourceId} 关联题目不存在：${id}`)
      assert.equal(q.review, 'reviewed')
      const embedded = q.sources.find((s) => s.id === entry.sourceId)
      assert.ok(embedded, `${id} 缺少来源正文`)
      for (const [key, value] of Object.entries(embedded))
        assert.deepEqual(source[key], value, `${id} 来源字段 ${key} 不一致`)
    }
  }
  for (const id of newQuestionIds) {
    const q = questions.get(id)
    assert.ok(q, `${id} 尚未入库`)
    assert.deepEqual(q, questionSchema.parse(await json(`content/questions/${id}.json`)))
  }
  const visible = list.questions.filter((q) => q.libraryId === 'ai-agents')
  assert.equal(visible.length, questions.size, '应用目录未展示全部题目')
  const topics = z
    .object({
      sourceId: z.string(),
      topics: z
        .array(
          z.object({
            number: z.number().int().min(1).max(32),
            prompt: z.string().min(1),
            questionIds: z.array(z.string()).min(1),
          }),
        )
        .length(32),
    })
    .parse(await json('content/intent-source-topic-coverage.json'))
  assert.equal(new Set(topics.topics.map((t) => t.number)).size, 32)
  const intentBody = bySource.get(topics.sourceId)?.evidence as string
  for (const topic of topics.topics) {
    assert.ok(intentBody.includes(topic.prompt), `意图原题 ${topic.number} 与正文不符`)
    for (const id of topic.questionIds) assert.equal(questions.get(id)?.review, 'reviewed')
  }
  const result = {
    verifiedAt: new Date().toISOString(),
    sourceCount: sources.length,
    coveredSources: entries.length,
    uncoveredSources: [],
    questionCount: questions.size,
    newQuestions: newQuestionIds.length,
    catalogCount: visible.length,
    intentTopics: 32,
    batches: batchResults,
  }
  const output = new URL('reports/question-completion-2026-10-24/', root)
  await mkdir(output, { recursive: true })
  await writeFile(
    new URL('coverage-verification.json', output),
    `${JSON.stringify(result, null, 2)}\n`,
  )
  console.log(JSON.stringify(result))
} finally {
  await sql.end()
}
