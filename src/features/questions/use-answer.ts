import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import type { Draft, Attempt } from '@/server/questions'
import { saveDraft, submitAnswer, evaluateAnswer } from '@/server/functions'
const draftSchema = z.object({
  id: z.uuid(),
  answer: z.string().max(12000),
  submitted: z.boolean(),
  revision: z.number().int().positive(),
})
export function useAnswer(
  libraryId: string,
  questionId: string,
  remote: Draft | null,
  attempts: Attempt[],
  refresh: () => Promise<void>,
) {
  const key = `interview-draft:${libraryId}:${questionId}`
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const lock = useRef(false)
  const revision = () => Math.max(Date.now(), (draft?.revision ?? 0) + 1)
  useEffect(() => {
    try {
      const text = localStorage.getItem(key)
      const local = text ? draftSchema.parse(JSON.parse(text)) : null
      const latest = local && (!remote || local.revision > remote.revision) ? local : remote
      const selected = latest ?? {
        id: crypto.randomUUID(),
        answer: '',
        submitted: false,
        revision: Date.now(),
      }
      setDraft({
        ...selected,
        submitted: selected.submitted || attempts.some((a) => a.id === selected.id),
      })
    } catch {
      setError('本地草稿读取失败，请检查浏览器存储')
    }
  }, [key])
  useEffect(() => {
    if (!draft) return
    setSaved(false)
    const timer = setTimeout(() => {
      saveDraft({ data: { libraryId, questionId, draft } })
        .then(() => {
          setSaved(true)
          setSaveError('')
        })
        .catch(() => setSaveError('草稿同步失败，请稍后重试'))
    }, 500)
    return () => clearTimeout(timer)
  }, [draft, libraryId, questionId])
  function persist(next: Draft) {
    try {
      localStorage.setItem(key, JSON.stringify(next))
      setError('')
    } catch {
      setError('本地保存失败，请检查浏览器存储')
    }
    setDraft(next)
  }
  function change(answer: string) {
    if (!draft || draft.submitted) return
    if (answer.length > 12000) {
      setError('答案最多 12000 字，未修改原草稿')
      return
    }
    persist({ ...draft, answer, revision: revision() })
  }
  function redo() {
    if (!draft || !draft.submitted) return
    persist({ id: crypto.randomUUID(), answer: '', submitted: false, revision: revision() })
  }
  async function grade(id: string) {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      await evaluateAnswer({ data: { id, libraryId } })
      await refresh()
    } catch {
      setError('评测请求中断，答案已保存，可重试')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  async function submit() {
    if (!draft || lock.current || draft.submitted || !draft.answer.trim()) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const current = { ...draft, answer: draft.answer, revision: revision() }
      persist(current)
      await submitAnswer({
        data: { libraryId, questionId, id: current.id, answer: current.answer },
      })
      persist({ ...current, submitted: true, revision: current.revision + 1 })
      await refresh()
      await evaluateAnswer({ data: { id: current.id, libraryId } })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败，答案已保留')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return { draft, error: error || saveError, busy, saved, change, redo, submit, grade }
}
