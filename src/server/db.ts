import postgres from 'postgres'
let connection: ReturnType<typeof postgres> | undefined
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('请配置 DATABASE_URL')
  return (connection ??= postgres(process.env.DATABASE_URL, {
    max: 5,
    transform: { undefined: null },
  }))
}
