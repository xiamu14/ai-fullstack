import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, Logger, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigurationService } from '../config/configuration.service.js';
import * as schema from './schema/index.js';

export type Database = NodePgDatabase<typeof schema>;
export type DatabaseTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];
export type DatabaseClient = Database | DatabaseTransaction;

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  private readonly transactions = new AsyncLocalStorage<DatabaseTransaction>();
  readonly db: Database;

  constructor(configuration: ConfigurationService) {
    this.pool = new Pool({
      connectionString: configuration.databaseUrl,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30_000,
    });
    this.pool.on('error', () => {
      this.logger.error('Idle database connection failed');
    });
    this.db = drizzle(this.pool, { schema });
  }

  get client(): DatabaseClient {
    return this.transactions.getStore() ?? this.db;
  }

  transaction<T>(work: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.client.transaction((tx) =>
      this.transactions.run(tx, () => work(tx)),
    );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
