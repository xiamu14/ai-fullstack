import { useState } from 'react'
import { Heading, Text } from 'react-aria-components'
import { motion } from 'motion/react'
import { Select, SelectItem } from '@/components/base/select/select'
import type { Attempt } from '@/server/questions'
import { EvaluationResult } from './evaluation-result'
import { evaluateAnswer } from '@/server/functions'
export function AnswerHistory({
  attempts,
  libraryId,
  refresh,
}: {
  attempts: Attempt[]
  libraryId: string
  refresh: () => Promise<void>
}) {
  const [chosen, setChosen] = useState(attempts[0]?.id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const current = attempts.find((a) => a.id === chosen) ?? attempts[0]
  const index = attempts.findIndex((a) => a.id === current?.id)
  const previous = attempts[index + 1]
  const comparable =
    current?.result &&
    previous?.result &&
    !current.result.uncertain &&
    !previous.result.uncertain &&
    current.snapshot.version === previous.snapshot.version &&
    current.result.model === previous.result.model &&
    current.result.policyVersion === previous.result.policyVersion
  async function retry() {
    if (!current || busy) return
    setBusy(true)
    setError('')
    try {
      await evaluateAnswer({ data: { id: current.id, libraryId } })
      await refresh()
    } catch {
      setError('评测请求中断，可重试')
    } finally {
      setBusy(false)
    }
  }
  if (!current) return <Text className="text-sm text-neutral-500">暂无记录</Text>
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Select
        aria-label="答题记录"
        selectedKey={current.id}
        onSelectionChange={(key) => setChosen(String(key))}
      >
        {attempts.map((a, i) => (
          <SelectItem key={a.id} id={a.id} textValue={`第 ${attempts.length - i} 次`}>
            第 {attempts.length - i} 次 ·{' '}
            {new Date(a.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </SelectItem>
        ))}
      </Select>
      <Text className="whitespace-pre-wrap break-words text-sm leading-6">{current.answer}</Text>
      {error && (
        <Text role="alert" className="text-sm text-red-700">
          {error}
        </Text>
      )}
      <EvaluationResult attempt={current} busy={busy} retry={retry} />
      {previous && (
        <motion.section className="flex flex-col gap-3">
          <Heading className="text-sm font-semibold">上次作答</Heading>
          {comparable ? (
            <>
              <Text className="text-sm">
                本次 {current.result!.score} 分 · 上次 {previous.result!.score} 分
              </Text>
              <Text className="text-sm">
                分数变化 {current.result!.score! - previous.result!.score! > 0 ? '+' : ''}
                {current.result!.score! - previous.result!.score!}
              </Text>
              {current.result!.criteria.map((c) => (
                <Text key={c.id} className="text-xs text-neutral-600">
                  {c.title}：{c.score.toFixed(1)} /{' '}
                  {previous.result!.criteria.find((p) => p.id === c.id)?.score.toFixed(1)}
                </Text>
              ))}
            </>
          ) : (
            <Text className="text-xs text-amber-700">评分口径不同或结果不确定，暂不比较</Text>
          )}
          <Text className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600">
            {previous.answer}
          </Text>
        </motion.section>
      )}
    </motion.div>
  )
}
