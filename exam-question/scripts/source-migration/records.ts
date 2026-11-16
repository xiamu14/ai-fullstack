import { createHash } from 'node:crypto'
import { z } from 'zod'

export const libraryId = 'ai-agents'
export const legacyDirectory = new URL('../../sources/notes/', import.meta.url)
export const reportDirectory = new URL(
  '../../reports/source-migration-2026-10-24/',
  import.meta.url,
)
export const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
export const noteSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  title: z.string(),
  author: z.string(),
  status: z.enum(['read', 'unavailable', 'outside-date']),
  published: z.number().int().optional(),
  updated: z.number().int().optional(),
  description: z.string().optional(),
  type: z.enum(['normal', 'video']).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.unknown()).optional(),
})
export type Note = z.infer<typeof noteSchema>
export const labels = ['knowledge', 'questions', 'media', 'off_topic'] as const
export const reviewSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  fileHash: z.string().length(64),
  bodyHash: z.string().length(64),
  decision: z.enum(['include', 'exclude', 'pending', 'failed']),
  reason: z.string().min(1),
  label: z.enum(labels).optional(),
  confidence: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
  raw: z.unknown().optional(),
  reviewer: z.enum(['rules', 'jev', 'manual']),
})
export type Review = z.infer<typeof reviewSchema>
export function exclusion(note: Note) {
  if (note.status !== 'read') return `采集状态：${note.status}`
  if (!note.description?.trim()) return '正文为空'
  if (
    !note.published ||
    note.published < Date.parse('2026-01-01T00:00:00+08:00') ||
    note.published >= Date.parse('2026-10-23T00:00:00+08:00')
  )
    return '原始发布日期不在历史采集范围内'
  return null
}
export function sourceContent(note: Note) {
  if (exclusion(note)) throw new Error(`帖子不可导入：${note.id}`)
  return {
    id: note.id,
    title: note.title,
    author: note.author,
    url: `https://www.xiaohongshu.com/explore/${note.id}`,
    published: new Date(note.published!).toISOString(),
    updated: note.updated ? new Date(note.updated).toISOString() : null,
    evidence: note.description!,
    scope: '仅正文',
    type: note.type,
    tags: note.tags ?? [],
  }
}
