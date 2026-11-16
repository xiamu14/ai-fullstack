import { z } from 'zod'
import { db } from '../src/server/db'
const id = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .parse(process.argv[2])
const name = z.string().trim().min(1).max(80).parse(process.argv[3])
const sql = db()
await sql`INSERT INTO libraries(id,name) VALUES (${id},${name})`
await sql.end()
console.log(`已创建题库：${name}`)
