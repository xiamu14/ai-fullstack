import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'
import { db } from './db'
import { getQuestion } from './questions'
import { gradingPolicy, questionSchema, submissionSchema } from '../domain/question'
import { summarize, calibrationSchema } from '../domain/grading'
import { callJev } from './jev'

export async function createAttempt(input: z.infer<typeof submissionSchema>) {
  const sql = db()
  const q = await getQuestion(input.libraryId, input.questionId)
  if (q.archived || q.review !== 'reviewed') throw new Error('该题当前不可提交')
  await sql`INSERT INTO attempts(id,library_id,question_id,answer,snapshot,status)
    VALUES (${input.id},${input.libraryId},${input.questionId},${input.answer},${sql.json(q)},'pending')
    ON CONFLICT(id) DO NOTHING`
  const [attempt] =
    await sql`SELECT library_id,question_id,answer FROM attempts WHERE id=${input.id}`
  if (
    attempt.library_id !== input.libraryId ||
    attempt.question_id !== input.questionId ||
    attempt.answer !== input.answer
  )
    throw new Error('作答编号已使用，请重做后提交')
  return { id: input.id }
}
export async function gradeAttempt(id: string, libraryId: string) {
  const sql = db()
  return sql.begin(async (tx) => {
    const [attempt] =
      await tx`SELECT * FROM attempts WHERE id=${id} AND library_id=${libraryId} FOR UPDATE`
    if (!attempt) throw new Error('作答不存在')
    if (attempt.status === 'completed') return { status: 'completed' as const }
    let raw: unknown
    try {
      const q = questionSchema.parse(attempt.snapshot)
      const config = JSON.parse(await readFile(resolve('content/calibration.json'), 'utf8'))
      const calibration = calibrationSchema.parse(config)
      if (
        calibration.model !== gradingPolicy.model ||
        calibration.policyVersion !== gradingPolicy.version
      )
        throw new Error('评分配置已变化，请先重新验证测试集')
      raw = await callJev(q, attempt.answer)
      const result = summarize(q, raw, calibration)
      if (result.model !== config.validatedSnapshot)
        throw new Error('模型快照已变化，请重新验证测试集')
      await tx`UPDATE attempts SET status='completed',result=${tx.json(JSON.parse(JSON.stringify(result)))},raw=${tx.json(JSON.parse(JSON.stringify(raw)))},error=NULL WHERE id=${id}`
      return { status: 'completed' as const }
    } catch (error) {
      const message = error instanceof Error ? error.message : '评测失败'
      await tx`UPDATE attempts SET status='failed',error=${message},raw=${raw === undefined ? null : tx.json(JSON.parse(JSON.stringify(raw)))} WHERE id=${id}`
      return { status: 'failed' as const }
    }
  })
}
