import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash, randomBytes } from 'node:crypto'
import postgres from 'postgres'
import { db } from '../../src/server/db'
import { legacyDirectory, reportDirectory, sha256, libraryId } from './records'
import { loadReviews, sourceHash, verifyStored } from './store'

const backupRoot = new URL('../../backups/source-migration-2026-10-24/', import.meta.url)
async function docker(args: string[], input?: Uint8Array) {
  const command = Bun.spawn(['docker', 'compose', 'exec', '-T', 'postgres', ...args], {
    stdin: input ? 'pipe' : 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  })
  if (input && command.stdin) {
    command.stdin.write(input)
    command.stdin.end()
  }
  const [stdout, stderr, code] = await Promise.all([
    new Response(command.stdout).arrayBuffer(),
    new Response(command.stderr).text(),
    command.exited,
  ])
  if (code !== 0) throw new Error(`备份验证命令失败：${args[0]}，${stderr}`)
  return Buffer.from(stdout)
}
async function tableHash(sql: ReturnType<typeof postgres>, table: string) {
  const rows = await sql`SELECT to_jsonb(t) AS row FROM ${sql(table)} AS t`
  return sourceHash(rows.map((row) => sourceHash(row.row)).sort())
}
const sql = db()
try {
  const allReviews = await loadReviews()
  const reviews = allReviews.filter((r) => r.decision === 'include')
  for (const review of reviews) await verifyStored(review)
  const archive = await readFile(new URL('notes.tar.gz', backupRoot))
  const restoredFiles = new URL('restore-files/', backupRoot)
  await mkdir(restoredFiles, { recursive: true, mode: 0o700 })
  const extract = Bun.spawn(
    ['tar', '-xzf', new URL('notes.tar.gz', backupRoot).pathname, '-C', restoredFiles.pathname],
    { stdout: 'pipe', stderr: 'pipe' },
  )
  const [extractError, extractCode] = await Promise.all([
    new Response(extract.stderr).text(),
    extract.exited,
  ])
  if (extractCode !== 0) throw new Error(`旧文件备份无法解压：${extractError}`)
  for (const review of allReviews) {
    const filename = `${review.id}.json`
    const restored = await readFile(new URL(`notes/${filename}`, restoredFiles), 'utf8')
    if (sha256(restored) !== review.fileHash) throw new Error(`旧文件备份不一致：${filename}`)
    try {
      const original = await readFile(new URL(filename, legacyDirectory), 'utf8')
      if (sha256(original) !== review.fileHash) throw new Error(`旧文件已变化：${filename}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  const dump = await docker([
    'pg_dump',
    '-U',
    'interview',
    '-d',
    'interview',
    '--clean',
    '--if-exists',
  ])
  await writeFile(new URL('migrated.sql', backupRoot), dump, { mode: 0o600 })
  const databases: string[] = []
  try {
    for (const stage of ['before', 'after'] as const) {
      const name = `source_restore_${randomBytes(5).toString('hex')}`
      await docker(['createdb', '-U', 'interview', name])
      databases.push(name)
      const input = stage === 'before' ? await readFile(new URL('database.sql', backupRoot)) : dump
      await docker(['psql', '-v', 'ON_ERROR_STOP=1', '-U', 'interview', '-d', name], input)
      const connection = new URL(process.env.DATABASE_URL!)
      connection.pathname = `/${name}`
      const restored = postgres(connection.href)
      try {
        const tables =
          stage === 'before'
            ? ['libraries', 'questions', 'attempts', 'drafts']
            : ['libraries', 'sources', 'questions', 'attempts', 'drafts', 'source_migrations']
        for (const table of tables) {
          if ((await tableHash(sql, table)) !== (await tableHash(restored, table)))
            throw new Error(`恢复核验不一致：${stage}/${table}`)
        }
        if (stage === 'before') {
          const previousSources =
            await restored`SELECT id,content FROM sources WHERE library_id=${libraryId}`
          for (const prior of previousSources) {
            const [current] =
              await sql`SELECT content FROM sources WHERE library_id=${libraryId} AND id=${prior.id}`
            if (!current || sourceHash(current.content) !== sourceHash(prior.content))
              throw new Error(`原有来源被改动：${prior.id}`)
          }
        }
      } finally {
        await restored.end()
      }
    }
  } finally {
    for (const name of databases) await docker(['dropdb', '-U', 'interview', name])
  }
  const hash = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')
  await writeFile(
    new URL('backup-verification.json', reportDirectory),
    JSON.stringify(
      {
        verified: true,
        verifiedAt: new Date().toISOString(),
        archiveHash: hash(archive),
        dumpHash: hash(dump),
        sourceCount: reviews.length,
        originalFilesVerified: allReviews.length,
        preservedTables: ['libraries', 'questions', 'attempts', 'drafts'],
        originalSourcesPreserved: true,
        restoration: '迁移前、迁移后各恢复到独立临时数据库并逐表核对内容哈希，结束后删除临时库',
      },
      null,
      2,
    ) + '\n',
  )
  console.log(
    `通过：${allReviews.length} 份旧文件备份、迁移前后独立库恢复、${reviews.length} 篇来源核验及原有题目草稿保护`,
  )
} finally {
  await sql.end()
}
