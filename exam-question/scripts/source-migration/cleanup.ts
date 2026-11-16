import { readFile, unlink } from 'node:fs/promises'
import { z } from 'zod'
import { db } from '../../src/server/db'
import { libraryId, legacyDirectory, reportDirectory, sha256 } from './records'
import { loadReviews, verifyStored } from './store'

const sql = db()
try {
  const proof = z
    .object({
      verified: z.literal(true),
      archiveHash: z.string().length(64),
      dumpHash: z.string().length(64),
      sourceCount: z.number().int().positive(),
    })
    .parse(JSON.parse(await readFile(new URL('backup-verification.json', reportDirectory), 'utf8')))
  const backupRoot = new URL('../../backups/source-migration-2026-10-24/', import.meta.url)
  const archive = await readFile(new URL('notes.tar.gz', backupRoot))
  const dump = await readFile(new URL('migrated.sql', backupRoot))
  const { createHash } = await import('node:crypto')
  const hash = (data: Buffer) => createHash('sha256').update(data).digest('hex')
  if (hash(archive) !== proof.archiveHash || hash(dump) !== proof.dumpHash)
    throw new Error('已验证备份发生变化，停止清理')
  const reviews = (await loadReviews()).filter((r) => r.decision === 'include')
  if (proof.sourceCount !== reviews.length) throw new Error('审核清单在备份验证后发生变化')
  for (const review of reviews) await verifyStored(review)
  let deleted = 0,
    alreadyDeleted = 0
  for (const review of reviews) {
    await verifyStored(review)
    const file = new URL(`${review.id}.json`, legacyDirectory)
    try {
      const text = await readFile(file, 'utf8')
      if (sha256(text) !== review.fileHash) throw new Error(`旧文件变化，停止删除：${review.id}`)
      await unlink(file)
      deleted++
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      alreadyDeleted++
    }
    await sql`UPDATE source_migrations SET deleted_at=COALESCE(deleted_at,now())
      WHERE library_id=${libraryId} AND source_id=${review.id}`
  }
  console.log(
    JSON.stringify({
      deleted,
      alreadyDeleted,
      retained: (await loadReviews()).filter((r) => r.decision !== 'include').length,
    }),
  )
} finally {
  await sql.end()
}
