import { readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { runner } from 'node-pg-migrate';
import type { Client } from 'pg';

export const migrationsTable = 'pgmigrations';
export const migrationFilePattern = /^\d+[-_][\w-]+\.sql$/;

type MigrationStatus = {
  name: string;
  status: 'applied' | 'pending' | 'missing';
};

export async function migrationStatus(
  client: Client,
  directory: string,
): Promise<MigrationStatus[]> {
  const files = (await readdir(directory)).filter((file) =>
    migrationFilePattern.test(file),
  );
  const available = new Set(files.map((file) => basename(file, extname(file))));
  const table = await client.query<{ present: string | null }>(
    "SELECT to_regclass('public.pgmigrations')::text AS present",
  );
  const applied = table.rows[0].present
    ? (
        await client.query<{ name: string }>(
          'SELECT name FROM public.pgmigrations ORDER BY id',
        )
      ).rows.map((row) => row.name)
    : [];
  const appliedNames = new Set(applied);
  return [
    ...applied.map((name) => ({
      name,
      status: available.has(name) ? ('applied' as const) : ('missing' as const),
    })),
    ...[...available]
      .filter((name) => !appliedNames.has(name))
      .sort()
      .map((name) => ({ name, status: 'pending' as const })),
  ];
}

export async function migrate(
  client: Client,
  directory: string,
  direction: 'up' | 'down',
  steps = 1,
): Promise<number> {
  const completed = await runner({
    dbClient: client,
    dir: directory,
    direction,
    ...(direction === 'down' ? { count: steps } : {}),
    migrationsTable,
    migrationsSchema: 'public',
    schema: 'public',
    singleTransaction: true,
    checkOrder: true,
    ignorePattern: `(?!${migrationFilePattern.source}).*`,
    logger: { info: () => undefined, warn: console.warn, error: console.error },
  });
  return completed.length;
}
