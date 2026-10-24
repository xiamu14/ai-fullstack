import { ModuleChip } from './module-chip'
import { useId, useState } from 'react'
import { Dialog, Modal, ModalOverlay, Heading, Text } from 'react-aria-components'
import { AnimatePresence, motion } from 'motion/react'
import { CloseButton } from '@/components/base/buttons/close-button'
import { Button, ButtonLink } from '@/components/base/buttons/button'
import { ChevronDownSmall } from '@/components/foundations/icons/chevrons'
import { Badge } from '@/components/base/badges/badge'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/base/segmented-control/segmented-control'
import type { loadDetail } from '@/server/functions'
import { AnswerEditor } from './answer-editor'
import { AnswerHistory } from './answer-history'
const MotionOverlay = motion.create(ModalOverlay)
const MotionModal = motion.create(Modal)
type Detail = Awaited<ReturnType<typeof loadDetail>>
export function QuestionDrawer({
  detail,
  close,
  refresh,
}: {
  detail: Detail
  close: () => void
  refresh: () => Promise<void>
}) {
  const [tab, setTab] = useState('answer')
  const [rubricOpen, setRubricOpen] = useState(false)
  const rubricId = useId()
  const { question, attempts, draft } = detail
  return (
    <MotionOverlay
      isOpen
      isDismissable
      onOpenChange={(open) => {
        if (!open) close()
      }}
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <MotionModal
        className="h-dvh w-[25vw] min-w-135 max-w-150 overflow-y-auto bg-white shadow-xl outline-none"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <Dialog aria-label="题目详情" className="flex min-h-full flex-col gap-5 p-5 outline-none">
          <motion.header className="flex items-center justify-between gap-3">
            <Heading slot="title" className="text-sm font-semibold">
              题目详情
            </Heading>
            <CloseButton aria-label="关闭详情" onClick={close} />
          </motion.header>
          <motion.section className="flex flex-col gap-3">
            <motion.div className="flex gap-2">
              <ModuleChip module={question.module} />
              <Badge>{question.difficulty}</Badge>
              {question.archived && <Badge>已归档</Badge>}
            </motion.div>
            <Heading className="text-lg font-semibold leading-7">{question.prompt}</Heading>
          </motion.section>
          <motion.section className="flex flex-col gap-2">
            <Heading className="text-xs font-medium text-neutral-500">来源帖子</Heading>
            {question.sources.map((s) => (
              <motion.div key={s.id} className="flex items-center justify-start gap-1">
                <ButtonLink
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  size="small"
                  className="h-auto whitespace-normal text-left"
                >
                  {s.title}
                </ButtonLink>
                <Text className="text-xs text-neutral-500">
                  {s.author} · {s.published ? s.published.slice(0, 10) : '日期未知'} · {s.scope}
                </Text>
              </motion.div>
            ))}
          </motion.section>
          <SegmentedControl
            aria-label="详情内容"
            selectedKeys={new Set([tab])}
            onSelectionChange={(keys) => setTab(String([...keys][0]))}
            className="w-full justify-between"
          >
            <SegmentedControlItem id="reference">参考答案</SegmentedControlItem>
            <SegmentedControlItem id="answer">开始作答</SegmentedControlItem>
            <SegmentedControlItem id="history">答题记录</SegmentedControlItem>
          </SegmentedControl>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {tab === 'reference' && (
                <motion.section className="flex flex-col gap-4">
                  <Text className="whitespace-pre-wrap break-words text-sm leading-6">
                    {question.reference}
                  </Text>
                  <Text className="text-xs leading-5 text-neutral-500">答案与细则由整理者补充</Text>
                  <motion.div className="flex items-center gap-1">
                    <Heading className="text-sm font-semibold">评分细则</Heading>
                    <Button
                      variant="secondary"
                      size="small"
                      aria-label={rubricOpen ? '收起评分细则' : '展开评分细则'}
                      aria-expanded={rubricOpen}
                      aria-controls={rubricId}
                      onClick={() => setRubricOpen((open) => !open)}
                      className="size-8 border-0 bg-transparent p-0 shadow-none [&>span]:p-0"
                    >
                      <motion.span
                        animate={{ rotate: rubricOpen ? 180 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDownSmall className="size-4" />
                      </motion.span>
                    </Button>
                  </motion.div>
                  <motion.div
                    id={rubricId}
                    hidden={!rubricOpen}
                    className="overflow-hidden"
                    initial={false}
                    animate={{ height: rubricOpen ? 'auto' : 0, opacity: rubricOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div className="flex flex-col gap-4">
                      {question.rubric.map((r) => (
                        <motion.div key={r.id} className="flex flex-col gap-1">
                          <Heading className="text-sm font-medium">
                            {r.title} · 权重 {r.weight}
                          </Heading>
                          {r.levels.map((level, i) => (
                            <Text key={i} className="text-xs leading-5 text-neutral-600">
                              {i} 分：{level}
                            </Text>
                          ))}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.section>
              )}
              {tab === 'answer' && (
                <AnswerEditor
                  libraryId={question.libraryId}
                  questionId={question.id}
                  remote={draft}
                  attempts={attempts}
                  refresh={refresh}
                  archived={question.archived}
                />
              )}
              {tab === 'history' && (
                <AnswerHistory
                  libraryId={question.libraryId}
                  attempts={attempts}
                  refresh={refresh}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Dialog>
      </MotionModal>
    </MotionOverlay>
  )
}
