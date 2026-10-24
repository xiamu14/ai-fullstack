import { db } from './db'
import { questionSchema, type Question } from '../domain/question'
import type { Evaluation } from '../domain/grading'
export type Attempt = {
  id: string
  answer: string
  snapshot: Question
  status: 'pending' | 'completed' | 'failed'
  result: Evaluation | null
  error: string | null
  createdAt: string
}
export type Draft = { id: string; answer: string; submitted: boolean; revision: number }
export async function catalog() {
  const sql = db()
  const [libraries, rows] = await Promise.all([
    sql<{ id: string; name: string }[]>`SELECT id,name FROM libraries ORDER BY name`,
    sql`SELECT content FROM questions ORDER BY id`,
  ])
  return {
    libraries,
    questions: rows
      .map((r) => questionSchema.parse(r.content))
      .filter((q) => q.review === 'reviewed')
      .map((q) => ({
        id: q.id,
        libraryId: q.libraryId,
        title: q.title,
        module: q.module,
        difficulty: q.difficulty,
        archived: q.archived,
        publishedAt: q.sources[0].published,
        publishedOn: q.sources[0].published
          ? new Date(q.sources[0].published).toLocaleDateString('zh-CN', {
              timeZone: 'Asia/Shanghai',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          : '日期未知',
      })),
  }
}
export async function getQuestion(libraryId: string, questionId: string) {
  const rows =
    await db()`SELECT content FROM questions WHERE library_id=${libraryId} AND id=${questionId}`
  if (!rows.length) throw new Error('题目不存在')
  return questionSchema.parse(rows[0].content)
}
export async function detail(libraryId: string, questionId: string) {
  const sql = db()
  const [question, rows, drafts] = await Promise.all([
    getQuestion(libraryId, questionId),
    sql`SELECT id,answer,snapshot,status,result,error,created_at FROM attempts
      WHERE library_id=${libraryId} AND question_id=${questionId} ORDER BY created_at DESC,id`,
    sql`SELECT content FROM drafts WHERE library_id=${libraryId} AND question_id=${questionId}`,
  ])
  const attempts: Attempt[] = rows.map((r) => ({
    id: r.id,
    answer: r.answer,
    snapshot: questionSchema.parse(r.snapshot),
    status: r.status,
    result: r.result,
    error: r.error,
    createdAt: r.created_at.toISOString(),
  }))
  return { question, attempts, draft: (drafts[0]?.content ?? null) as Draft | null }
}
