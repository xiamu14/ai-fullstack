import { readFile, readdir } from 'node:fs/promises'
import { z } from 'zod'
import { db } from '../../src/server/db'
import {
  libraryId,
  reportDirectory,
  reviewSchema,
  sha256,
  type Note,
  type Review,
  sourceContent,
} from './records'

export const sourceHash = (content: unknown) => sha256(JSON.stringify(canonical(content)))
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    )
  return value
}
export async function loadReviews() {
  const files = (await readdir(reportDirectory))
    .filter((f) => /^[a-f0-9]{24}\.json$/.test(f))
    .sort()
  const reviews = await Promise.all(
    files.map(async (file) =>
      reviewSchema.parse(JSON.parse(await readFile(new URL(file, reportDirectory), 'utf8'))),
    ),
  )
  if (reviews.some((r) => r.decision === 'pending'))
    throw new Error('存在待复核条目，请先完成逐篇审核')
  return reviews
}
export async function ensureSchema() {
  const sql = db()
  await sql`CREATE TABLE IF NOT EXISTS source_migrations (
    library_id text, source_id text, file_hash text NOT NULL, body_hash text NOT NULL,
    source_hash text NOT NULL, review jsonb NOT NULL,
    migrated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
    PRIMARY KEY(library_id,source_id), FOREIGN KEY(library_id,source_id) REFERENCES sources(library_id,id))`
}
export function verifyContent(note: Note, content: unknown) {
  const expected = sourceContent(note)
  const stored = z
    .object({
      id: z.string(),
      title: z.string(),
      author: z.string(),
      url: z.string(),
      published: z.string(),
      evidence: z.string(),
      scope: z.literal('仅正文'),
    })
    .parse(content)
  for (const key of ['id', 'title', 'author', 'url', 'evidence', 'scope'] as const) {
    if (stored[key] !== expected[key])
      throw new Error(`已有来源内容冲突：${note.id}/${key}，保留原内容和旧文件`)
  }
  if (Date.parse(stored.published) !== Date.parse(expected.published))
    throw new Error(`已有来源日期冲突：${note.id}`)
}
export async function verifyStored(review: Review) {
  const [row] = await db()`SELECT s.content,m.file_hash,m.body_hash,m.source_hash
    FROM source_migrations m JOIN sources s ON s.library_id=m.library_id AND s.id=m.source_id
    WHERE m.library_id=${libraryId} AND m.source_id=${review.id}`
  if (
    !row ||
    row.file_hash !== review.fileHash ||
    row.body_hash !== review.bodyHash ||
    row.source_hash !== sourceHash(row.content)
  )
    throw new Error(`来源核验失败：${review.id}`)
  const content = z.object({ evidence: z.string() }).parse(row.content)
  if (sha256(content.evidence) !== review.bodyHash) throw new Error(`正文哈希不一致：${review.id}`)
  return row
}
