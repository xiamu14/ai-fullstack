import { z } from 'zod'
import type { Question } from './question'

const probability = z.number().min(0).max(1)
const scoreAnswer = z.object({
  type: z.literal('score'),
  score: z.number().min(0).max(4),
  confidence: probability,
  probabilities: z.object({
    '0': probability,
    '1': probability,
    '2': probability,
    '3': probability,
    '4': probability,
  }),
})
const responseSchema = z.object({
  model: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
})
export type Evaluation = {
  model: string
  score: number | null
  uncertain: boolean
  critical: boolean | null
  criteria: {
    id: string
    title: string
    score: number
    confidence: number
    missing: string | null
  }[]
  policyVersion: string
}
export const calibrationSchema = z
  .object({
    model: z.string().min(1),
    policyVersion: z.string().min(1),
    confidence: probability,
    criticalLow: probability,
    criticalHigh: probability,
  })
  .refine((c) => c.criticalLow < c.criticalHigh, '关键错误概率边界无效')
export type Calibration = z.infer<typeof calibrationSchema>
export function summarize(question: Question, raw: unknown, calibration: Calibration): Evaluation {
  const result = responseSchema.parse(raw)
  const criteria = question.rubric.map((r) => {
    const a = scoreAnswer.parse(result.answers[r.id])
    return {
      id: r.id,
      title: r.title,
      score: a.score,
      confidence: a.confidence,
      missing: a.score < 3.5 ? r.missing : null,
    }
  })
  const criticalProbability = z
    .object({ type: z.literal('noul'), noul: probability })
    .parse(result.answers.critical).noul
  const critical =
    criticalProbability >= calibration.criticalHigh
      ? true
      : criticalProbability <= calibration.criticalLow
        ? false
        : null
  const uncertain = critical === null || criteria.some((c) => c.confidence < calibration.confidence)
  const weighted = criteria.reduce(
    (total, c, i) => total + (c.score * question.rubric[i].weight) / 4,
    0,
  )
  const total = Math.round((100 * weighted) / question.rubric.reduce((s, r) => s + r.weight, 0))
  return {
    model: result.model,
    criteria,
    uncertain,
    critical,
    score: uncertain ? null : Math.min(total, critical ? 59 : 100),
    policyVersion: calibration.policyVersion,
  }
}
