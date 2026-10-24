import { z } from 'zod'

export const modules = [
  '模型交互',
  '检索增强',
  '决策编排',
  '工具执行',
  '上下文记忆',
  '工程质量',
  '系统设计',
] as const
export const rubricSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  title: z.string().min(1),
  weight: z.number().positive(),
  levels: z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
  missing: z.string().min(1),
})
export const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    libraryId: z.string().min(1),
    title: z.string().min(1),
    prompt: z.string().min(1),
    module: z.enum(modules),
    difficulty: z.enum(['L1', 'L2', 'L3', 'L4']),
    version: z.string().min(1),
    review: z.enum(['draft', 'reviewed']),
    reference: z.string().min(1),
    supplement: z.string().min(1),
    rubric: z.array(rubricSchema).min(3).max(5),
    criticalError: z.string().min(1),
    sources: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          author: z.string(),
          url: z.url().refine((url) => url.startsWith('https://')),
          published: z.string().nullable(),
          evidence: z.string().min(1),
          scope: z.literal('仅正文'),
        }),
      )
      .min(1),
    archived: z.boolean(),
  })
  .superRefine((q, ctx) => {
    if (new Set(q.rubric.map((r) => r.id)).size !== q.rubric.length)
      ctx.addIssue({ code: 'custom', message: '考点 ID 重复' })
  })
export type Question = z.infer<typeof questionSchema>
export type Criterion = z.infer<typeof rubricSchema>
export const answerSchema = z
  .string()
  .max(12000, '答案最多 12000 字')
  .refine((answer) => answer.trim().length > 0, '请填写答案')
export const submissionSchema = z.object({
  libraryId: z.string().min(1),
  questionId: z.string().min(1),
  id: z.uuid(),
  answer: answerSchema,
})
export const gradingPolicy = {
  model: 'typesafe/jev-1.14',
  version: 'rubric-v1',
  maxLength: 12000,
} as const

export function moduleLabel(module: string) {
  return module === '上下文记忆' ? '会话记忆' : module
}
