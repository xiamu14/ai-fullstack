import { mkdir, writeFile } from 'node:fs/promises'
import { db } from '../src/server/db'
import { questionSchema } from '../src/domain/question'
const sql = db()
const rows = await sql`SELECT content FROM questions ORDER BY library_id,id`
const output = new URL('../content/markdown/', import.meta.url)
await mkdir(output, { recursive: true })
for (const row of rows) {
  const q = questionSchema.parse(row.content)
  const markdown = `# ${q.title}\n\nID: ${q.id}\nLibrary: ${q.libraryId}\nVersion: ${q.version}\n\n模块：${q.module} · 难度：${q.difficulty}\n\n## 题干\n\n${q.prompt}\n\n## 参考答案\n\n${q.reference}\n\n${q.supplement}\n\n## 评分细则\n\n${q.rubric.map((r) => `### ${r.title}（权重 ${r.weight}）\n\n${r.levels.map((level, i) => `${i}. ${level}`).join('\n')}\n`).join('\n')}\n关键错误：${q.criticalError}\n\n## 来源\n\n${q.sources.map((s) => `[${s.title}](${s.url})，${s.author}，${s.published ?? '日期未知'}，${s.scope}。\n\n${s.evidence}`).join('\n\n')}\n`
  if (markdown.split('\n').length > 300) throw new Error(`${q.id} 导出超过 300 行，请拆分内容`)
  await writeFile(new URL(`${q.libraryId}-${q.id}.md`, output), markdown.replace(/[ \t]+$/gm, ''))
}
await sql.end()
console.log(`已导出 ${rows.length} 题；不包含作答记录`)
