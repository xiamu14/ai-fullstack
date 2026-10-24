import { Text } from 'react-aria-components'
import { motion } from 'motion/react'
import { Textarea } from '@/components/base/textarea/textarea'
import { Button } from '@/components/base/buttons/button'
import type { Attempt, Draft } from '@/server/questions'
import { useAnswer } from './use-answer'
import { EvaluationResult } from './evaluation-result'
export function AnswerEditor({
  libraryId,
  questionId,
  remote,
  attempts,
  refresh,
  archived,
}: {
  libraryId: string
  questionId: string
  remote: Draft | null
  attempts: Attempt[]
  refresh: () => Promise<void>
  archived: boolean
}) {
  const state = useAnswer(libraryId, questionId, remote, attempts, refresh)
  const current = attempts.find((a) => a.id === state.draft?.id)
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Textarea
        label="你的答案"
        aria-label="你的答案"
        rows={10}
        resize="vertical"
        value={state.draft?.answer ?? ''}
        onChange={state.change}
        isReadOnly={state.draft?.submitted || archived}
        isDisabled={!state.draft || state.busy}
        placeholder="写下你的理解…"
        hint="最多 12000 字"
      />
      <Text className="text-xs text-neutral-500" aria-live="polite">
        {state.draft?.submitted ? '答案已提交' : state.saved ? '草稿已保存' : '正在保存'}
      </Text>
      {state.error && (
        <Text role="alert" className="text-sm text-red-700">
          {state.error}
        </Text>
      )}
      {!state.draft?.submitted ? (
        <Button
          onClick={state.submit}
          disabled={!state.draft?.answer.trim() || state.busy || archived}
        >
          {state.busy ? '评测中' : '提交评测'}
        </Button>
      ) : (
        <Button variant="secondary" onClick={state.redo} disabled={state.busy || archived}>
          重新作答
        </Button>
      )}
      <Text className="text-xs text-neutral-500">题目、评分依据及答案发往 OpenRouter</Text>
      <Text className="text-xs text-neutral-500">由 TypeSafe Jev 评测</Text>
      {current && (
        <EvaluationResult
          attempt={current}
          busy={state.busy}
          retry={() => state.grade(current.id)}
        />
      )}
    </motion.div>
  )
}
