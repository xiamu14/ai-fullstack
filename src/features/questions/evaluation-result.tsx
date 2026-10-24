import { Heading, Text } from 'react-aria-components'
import { motion } from 'motion/react'
import { Button } from '@/components/base/buttons/button'
import type { Attempt } from '@/server/questions'
export function EvaluationResult({
  attempt,
  retry,
  busy,
}: {
  attempt: Attempt
  retry?: () => void
  busy?: boolean
}) {
  const result = attempt.result
  return (
    <motion.section
      className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {result ? (
        <>
          <Heading className="text-lg font-semibold">
            {result.uncertain ? '评测不确定' : `${result.score} 分`}
          </Heading>
          {result.critical && (
            <Text role="alert" className="text-sm font-medium text-red-700">
              关键错误：{attempt.snapshot.criticalError}
            </Text>
          )}
          {result.critical === null && (
            <Text className="text-sm text-amber-700">关键判断不明确，未给总分</Text>
          )}
          {result.criteria.map((c) => (
            <motion.div key={c.id} className="flex flex-col gap-1">
              <Text className="text-sm font-medium">
                {c.title} · {c.score.toFixed(1)} / 4
              </Text>
              {c.missing && <Text className="text-xs leading-5 text-neutral-600">{c.missing}</Text>}
            </motion.div>
          ))}
          <Text className="break-all text-xs text-neutral-400">{result.model}</Text>
        </>
      ) : (
        <>
          <Text className="text-sm">
            {busy
              ? '正在评测，答案已保存'
              : attempt.status === 'failed'
                ? '评测失败，可重试'
                : '答案已保存，等待评测'}
          </Text>
          {attempt.error && <Text className="text-xs text-red-700">{attempt.error}</Text>}
          {retry && (
            <Button variant="secondary" size="small" disabled={busy} onClick={retry}>
              {attempt.status === 'failed' ? '重试评测' : '继续评测'}
            </Button>
          )}
        </>
      )}
    </motion.section>
  )
}
