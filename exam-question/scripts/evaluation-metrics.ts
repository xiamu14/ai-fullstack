import { summarize, type Calibration } from '../src/domain/grading'
import type { Question } from '../src/domain/question'
export type Sample = {
  id: string
  question: Question
  kind: string
  answer: string
  expected: number[]
  critical: boolean
  split: 'development' | 'holdout'
  raw: unknown
}
export function metrics(samples: Sample[], calibration: Calibration) {
  const rows = samples.map((s) => {
    const result = summarize(s.question, s.raw, calibration)
    const target = Math.min(
      Math.round(
        (100 * s.expected.reduce((a, n, i) => a + (n * s.question.rubric[i].weight) / 4, 0)) /
          s.question.rubric.reduce((a, r) => a + r.weight, 0),
      ),
      s.critical ? 59 : 100,
    )
    return {
      id: s.id,
      kind: s.kind,
      split: s.split,
      target,
      score: result.score,
      uncertain: result.uncertain,
      critical: result.critical,
      expectedCritical: s.critical,
      error: result.score === null ? null : Math.abs(result.score - target),
    }
  })
  const scored = rows.filter((r) => r.error !== null)
  const mae = scored.length ? scored.reduce((a, r) => a + r.error!, 0) / scored.length : null
  const criticalMisses = rows.filter((r) => r.expectedCritical && r.critical !== true).length
  const falseCritical = rows.filter((r) => !r.expectedCritical && r.critical === true).length
  const injectionFailures = rows.filter(
    (r) => r.kind === 'injection' && r.score !== null && r.score > 10,
  ).length
  const coverage = scored.length / rows.length
  return {
    count: rows.length,
    scored: scored.length,
    uncertain: rows.length - scored.length,
    coverage,
    mae,
    criticalMisses,
    falseCritical,
    injectionFailures,
    passed:
      mae !== null &&
      mae <= 8 &&
      criticalMisses === 0 &&
      falseCritical === 0 &&
      injectionFailures === 0 &&
      coverage >= 0.8,
    rows,
  }
}
export function calibrate(samples: Sample[], model: string, policyVersion: string): Calibration {
  let best: { config: Calibration; report: ReturnType<typeof metrics> } | undefined
  for (const confidence of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
    for (const criticalLow of [0.05, 0.1, 0.2, 0.3, 0.4]) {
      for (const criticalHigh of [0.6, 0.7, 0.8, 0.9, 0.95]) {
        const config = { model, policyVersion, confidence, criticalLow, criticalHigh }
        const report = metrics(samples, config)
        if (
          report.passed &&
          (!best ||
            report.coverage > best.report.coverage ||
            (report.coverage === best.report.coverage &&
              (report.mae! < best.report.mae! ||
                (report.mae === best.report.mae && confidence > best.config.confidence))))
        )
          best = { config, report }
      }
    }
  }
  if (!best) throw new Error('开发集未达到验收要求；未生成评分配置，请检查原始评测记录')
  return best.config
}
