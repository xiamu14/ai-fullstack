import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { submissionSchema } from '../domain/question'
const identity = z.object({ libraryId: z.string().min(1), questionId: z.string().min(1) })
export const loadCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const { catalog } = await import('./questions')
  return catalog()
})
export const loadDetail = createServerFn({ method: 'GET' })
  .validator(identity)
  .handler(async ({ data }) => {
    const { detail } = await import('./questions')
    return detail(data.libraryId, data.questionId)
  })
export const saveDraft = createServerFn({ method: 'POST' })
  .validator(
    identity.extend({
      draft: z.object({
        id: z.uuid(),
        answer: z.string().max(12000),
        submitted: z.boolean(),
        revision: z.number().int().positive(),
      }),
    }),
  )
  .handler(async ({ data }) => {
    const { db } = await import('./db')
    const sql = db()
    await sql`INSERT INTO drafts(library_id,question_id,content,revision)
    VALUES (${data.libraryId},${data.questionId},${sql.json(data.draft)},${data.draft.revision})
    ON CONFLICT(library_id,question_id) DO UPDATE SET content=EXCLUDED.content,revision=EXCLUDED.revision
    WHERE drafts.revision < EXCLUDED.revision`
    return { saved: true }
  })
export const submitAnswer = createServerFn({ method: 'POST' })
  .validator(submissionSchema)
  .handler(async ({ data }) => {
    const { createAttempt } = await import('./attempts')
    return createAttempt(data)
  })
export const evaluateAnswer = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), libraryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { gradeAttempt } = await import('./attempts')
    return gradeAttempt(data.id, data.libraryId)
  })
