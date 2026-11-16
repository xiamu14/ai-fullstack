import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Client } from 'pg';

export async function seed(client: Client, directory: string): Promise<number> {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  if (files.length === 0) return 0;
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(7241865325823964)');
    for (const file of files) {
      await client.query(await readFile(join(directory, file), 'utf8'));
    }
    await client.query('COMMIT');
    return files.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
