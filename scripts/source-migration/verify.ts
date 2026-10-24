import { readFile, writeFile } from 'node:fs/promises'
import { db } from '../../src/server/db'
import { legacyDirectory, reportDirectory, sha256 } from './records'
import { loadReviews, verifyStored } from './store'
const sql = db()
try {
  const reviews = (await loadReviews()).filter((r) => r.decision === 'include')
  let filesPresent = 0
  for (const review of reviews) {
    await verifyStored(review)
    try {
      const text = await readFile(new URL(`${review.id}.json`, legacyDirectory), 'utf8')
      if (sha256(text) !== review.fileHash) throw new Error(`旧文件核验失败：${review.id}`)
      filesPresent++
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  await writeFile(
    new URL('verification.json', reportDirectory),
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        verified: reviews.length,
        filesPresent,
        deleted: reviews.length - filesPresent,
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`核验通过：${reviews.length} 篇，旧文件剩余 ${filesPresent} 篇`)
} finally {
  await sql.end()
}
