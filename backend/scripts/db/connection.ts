import { Client } from 'pg';
import { runtimePath } from '../shared/process.js';

export function databaseConfig() {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@127.0.0.1:5432/backend';
  let valid = false;
  try {
    valid = ['postgres:', 'postgresql:'].includes(
      new URL(connectionString).protocol,
    );
  } catch {
    valid = false;
  }
  if (!valid) throw new Error('DATABASE_URL 必须是 PostgreSQL 连接串');
  return {
    connectionString,
    migrationsDir: runtimePath('database/migrations'),
    seedsDir: runtimePath('database/seeds'),
  };
}

export async function withDatabase<T>(
  config: { connectionString: string },
  action: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString: config.connectionString,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    return await action(client);
  } finally {
    await client.end();
  }
}
