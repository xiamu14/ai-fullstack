import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { migrate, migrationStatus } from '../scripts/db/migrations.js';
import { seed } from '../scripts/db/seed.js';

const databaseUrl = process.env.SCRIPT_TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)('PostgreSQL 脚本事务 (e2e)', () => {
  const databaseName = `script_test_${randomUUID().replaceAll('-', '')}`;
  let admin: Client;
  let client: Client;
  let directory: string;
  let migrations: string;
  let seeds: string;
  let created = false;

  beforeAll(async () => {
    admin = new Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5000,
    });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${databaseName}"`);
    created = true;
    const url = new URL(databaseUrl!);
    url.pathname = `/${databaseName}`;
    client = new Client({
      connectionString: url.toString(),
      connectionTimeoutMillis: 5000,
    });
    await client.connect();
    directory = await mkdtemp(join(tmpdir(), 'backend-db-test-'));
    migrations = join(directory, 'migrations');
    seeds = join(directory, 'seeds');
    await mkdir(migrations);
    await mkdir(seeds);
    await writeFile(join(migrations, '.gitkeep'), '');
    await writeFile(join(migrations, 'README.md'), 'Not a migration');
  });

  afterAll(async () => {
    await client?.end();
    if (created) await admin.query(`DROP DATABASE "${databaseName}"`);
    await admin?.end();
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  it('状态只读，迁移和回滚可重复执行，种子失败整体回滚', async () => {
    await writeFile(
      join(migrations, '1794787200000-check.sql'),
      `
-- Up Migration
CREATE TABLE script_check (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
-- Down Migration
DROP TABLE script_check;
`,
    );
    expect(await migrationStatus(client, migrations)).toEqual([
      { name: '1794787200000-check', status: 'pending' },
    ]);
    const before = await client.query(
      "SELECT to_regclass('public.pgmigrations') AS present",
    );
    expect(before.rows[0].present).toBeNull();
    expect(await migrate(client, migrations, 'up')).toBe(1);
    expect(await migrate(client, migrations, 'up')).toBe(0);
    expect((await migrationStatus(client, migrations))[0].status).toBe(
      'applied',
    );

    await writeFile(
      join(seeds, '001-check.sql'),
      "INSERT INTO script_check VALUES (1, 'seed') ON CONFLICT (id) DO NOTHING;",
    );
    expect(await seed(client, seeds)).toBe(1);
    expect(await seed(client, seeds)).toBe(1);
    const rows = await client.query(
      'SELECT count(*)::int AS count FROM script_check',
    );
    expect(rows.rows[0].count).toBe(1);

    await writeFile(
      join(seeds, '002-change.sql'),
      "UPDATE script_check SET name = 'changed' WHERE id = 1;",
    );
    await writeFile(
      join(seeds, '003-invalid.sql'),
      'INSERT INTO missing_table VALUES (1);',
    );
    await expect(seed(client, seeds)).rejects.toThrow();
    expect(
      (await client.query('SELECT name FROM script_check WHERE id = 1')).rows[0]
        .name,
    ).toBe('seed');

    expect(await migrate(client, migrations, 'down')).toBe(1);
    const after = await client.query(
      "SELECT to_regclass('public.script_check') AS present",
    );
    expect(after.rows[0].present).toBeNull();
    expect((await migrationStatus(client, migrations))[0].status).toBe(
      'pending',
    );
  });
});
