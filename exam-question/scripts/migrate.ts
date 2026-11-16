import { db } from '../src/server/db'
const sql = db()
await sql.begin(async (tx) => {
  await tx`CREATE TABLE IF NOT EXISTS libraries (id text PRIMARY KEY, name text NOT NULL UNIQUE)`
  await tx`CREATE TABLE IF NOT EXISTS sources (
    library_id text REFERENCES libraries(id), id text, content jsonb NOT NULL,
    PRIMARY KEY(library_id,id))`
  await tx`CREATE TABLE IF NOT EXISTS questions (
    library_id text REFERENCES libraries(id), id text, version text NOT NULL, content jsonb NOT NULL,
    PRIMARY KEY(library_id,id))`
  await tx`ALTER TABLE questions ADD COLUMN IF NOT EXISTS imported_on date`
  await tx`ALTER TABLE questions ALTER COLUMN imported_on
    SET DEFAULT ((now() AT TIME ZONE 'Asia/Shanghai')::date)`
  // Existing questions were imported on this date, confirmed by the user.
  await tx`UPDATE questions SET imported_on=DATE '2026-10-24' WHERE imported_on IS NULL`
  await tx`ALTER TABLE questions ALTER COLUMN imported_on SET NOT NULL`
  await tx`CREATE TABLE IF NOT EXISTS attempts (
    id uuid PRIMARY KEY, library_id text NOT NULL, question_id text NOT NULL,
    answer text NOT NULL CHECK(length(trim(answer)) BETWEEN 1 AND 12000), snapshot jsonb NOT NULL,
    status text NOT NULL CHECK(status IN ('pending','completed','failed')), result jsonb, error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY(library_id,question_id) REFERENCES questions(library_id,id))`
  await tx`ALTER TABLE attempts ADD COLUMN IF NOT EXISTS raw jsonb`
  await tx`CREATE INDEX IF NOT EXISTS attempts_question ON attempts(library_id,question_id,created_at DESC)`
  await tx`CREATE TABLE IF NOT EXISTS drafts (
    library_id text, question_id text, content jsonb NOT NULL, revision bigint NOT NULL,
    PRIMARY KEY(library_id,question_id),
    FOREIGN KEY(library_id,question_id) REFERENCES questions(library_id,id))`
  await tx`INSERT INTO libraries(id,name) VALUES ('ai-agents','AI Agents') ON CONFLICT(id) DO NOTHING`
})
await sql.end()
console.log('数据库结构已更新')
