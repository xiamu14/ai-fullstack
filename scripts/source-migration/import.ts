import { readFile } from 'node:fs/promises'
import { db } from '../../src/server/db'
import { libraryId, legacyDirectory, noteSchema, sha256, sourceContent } from './records'
import { ensureSchema, loadReviews, sourceHash, verifyContent, verifyStored } from './store'

const sql = db()
try {
  await ensureSchema()
  const reviews = (await loadReviews()).filter((r) => r.decision === 'include')
  let inserted = 0,
    existing = 0
  for (const review of reviews) {
    const [receipt] =
      await sql`SELECT source_id FROM source_migrations WHERE library_id=${libraryId} AND source_id=${review.id}`
    if (receipt) {
      await verifyStored(review)
      existing++
      continue
    }
    const text = await readFile(new URL(`${review.id}.json`, legacyDirectory), 'utf8')
    if (sha256(text) !== review.fileHash) throw new Error(`审核后文件发生变化：${review.id}`)
    const note = noteSchema.parse(JSON.parse(text))
    if (note.id !== review.id || sha256(note.description ?? '') !== review.bodyHash)
      throw new Error(`帖子与审核不一致：${review.id}`)
    const added = await sql.begin(async (tx) => {
      const rows = await tx`INSERT INTO sources(library_id,id,content)
        VALUES (${libraryId},${note.id},${tx.json(sourceContent(note))}) ON CONFLICT DO NOTHING RETURNING id`
      const [stored] =
        await tx`SELECT content FROM sources WHERE library_id=${libraryId} AND id=${note.id} FOR UPDATE`
      verifyContent(note, stored.content)
      await tx`INSERT INTO source_migrations(library_id,source_id,file_hash,body_hash,source_hash,review)
        VALUES (${libraryId},${note.id},${review.fileHash},${review.bodyHash},${sourceHash(stored.content)},${tx.json(JSON.parse(JSON.stringify(review)))})`
      return rows.length
    })
    // Read back after commit; a successful insert alone never authorizes deleting the old file.
    await verifyStored(review)
    if (added) inserted++
    else existing++
  }
  console.log(
    JSON.stringify({ approved: reviews.length, inserted, existing, verified: reviews.length }),
  )
} finally {
  await sql.end()
}
