import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const root = new URL('../../', import.meta.url)
const { batches } = z
  .object({
    batches: z
      .array(z.string().regex(/^[a-z0-9-]+$/))
      .min(1)
      .max(4),
  })
  .parse(
    JSON.parse(
      await readFile(new URL('content/question-completion-2026-10-24.json', root), 'utf8'),
    ),
  )
if (new Set(batches).size !== batches.length) throw new Error('批次重复')
const questionIds: string[] = []
for (const batch of batches) {
  const manifest = z
    .object({ questionIds: z.array(z.string()).min(1) })
    .parse(JSON.parse(await readFile(new URL(`content/${batch}.json`, root), 'utf8')))
  questionIds.push(...manifest.questionIds)
}
if (new Set(questionIds).size !== questionIds.length)
  throw new Error('批次之间题目重复，停止并发执行')
const results = await Promise.all(
  batches.map(
    (batch) =>
      new Promise<number>((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [fileURLToPath(new URL('evaluate.ts', import.meta.url)), batch],
          {
            cwd: fileURLToPath(root),
            stdio: 'inherit',
            env: process.env,
          },
        )
        child.once('error', reject)
        child.once('exit', (code, signal) => {
          console.log(`${batch}: ${signal ? `中断 ${signal}` : `退出 ${code}`}`)
          resolve(code ?? 1)
        })
      }),
  ),
)
if (results.some((code) => code !== 0)) process.exitCode = 1
