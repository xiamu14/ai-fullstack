import { readdir, readFile } from 'node:fs/promises'
import { questionSchema } from '../src/domain/question'
import { db } from '../src/server/db'
const sql = db()
let imported = 0
const files = (await readdir(new URL('../content/questions/', import.meta.url)))
  .filter((f) => f.endsWith('.json'))
  .sort()
const questions = await Promise.all(
  files.map(async (f) =>
    questionSchema.parse(
      JSON.parse(await readFile(new URL(`../content/questions/${f}`, import.meta.url), 'utf8')),
    ),
  ),
)
await sql.begin(async (tx) => {
  for (const q of questions) {
    if (q.review !== 'reviewed') continue
    const libraries = await tx`SELECT id FROM libraries WHERE id=${q.libraryId}`
    if (!libraries.length) throw new Error(`题库不存在：${q.libraryId}，请先在 libraries 建立题库`)
    for (const source of q.sources)
      await tx`INSERT INTO sources(library_id,id,content)
      VALUES (${q.libraryId},${source.id},${tx.json(source)}) ON CONFLICT DO NOTHING`
    const rows = await tx`INSERT INTO questions(library_id,id,version,content)
      VALUES (${q.libraryId},${q.id},${q.version},${tx.json(q)}) ON CONFLICT DO NOTHING RETURNING id`
    imported += rows.length
  }
})
await sql.end()
console.log(`新增 ${imported} 题；已有题目保留人工修订，不覆盖`)
