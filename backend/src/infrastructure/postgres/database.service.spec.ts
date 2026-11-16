import type { ConfigurationService } from '../config/configuration.service.js';
import { createAuth } from '../identity/better-auth.factory.js';
import type { MailService } from '../mail/mail.service.js';
import {
  DatabaseService,
  type DatabaseTransaction,
} from './database.service.js';
import * as schema from './schema/index.js';

const configuration = {
  databaseUrl: 'postgresql://postgres:postgres@127.0.0.1:5432/backend',
  authUrl: 'http://localhost:3020',
  authPath: '/rpc/v1/auth',
  authSecret: '0123456789abcdef0123456789abcdef',
  trustedOrigins: ['http://localhost:3020'],
  googleClientId: undefined,
  googleClientSecret: undefined,
} as unknown as ConfigurationService;

const mail = {
  sendVerificationOtp: vi.fn(),
} as unknown as MailService;

describe('DatabaseService & Drizzle schema', () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService(configuration);
  });

  afterEach(async () => {
    await service.onApplicationShutdown();
  });

  it('initializes Drizzle with auth schema tables and relations', () => {
    expect(service.db).toBeDefined();
    expect(service.client).toBe(service.db);
    expect(service.db.query.auth_user).toBeDefined();
    expect(service.db.query.auth_session).toBeDefined();
    expect(service.db.query.auth_account).toBeDefined();
    expect(service.db.query.auth_verification).toBeDefined();
    expect(schema.auth_user).toBeDefined();
  });

  it('propagates transaction client through AsyncLocalStorage and supports nesting', async () => {
    const outerTx = {
      transaction: vi.fn(
        async <T>(work: (tx: DatabaseTransaction) => Promise<T>) =>
          work(innerTx),
      ),
    } as unknown as DatabaseTransaction;
    const innerTx = {
      transaction: vi.fn(),
    } as unknown as DatabaseTransaction;

    vi.spyOn(service.db, 'transaction').mockImplementation(async (work) =>
      work(outerTx),
    );

    expect(service.client).toBe(service.db);

    const result = await service.transaction(async (tx) => {
      expect(tx).toBe(outerTx);
      expect(service.client).toBe(outerTx);

      await service.transaction(async (nested) => {
        expect(nested).toBe(innerTx);
        expect(service.client).toBe(innerTx);
      });

      expect(service.client).toBe(outerTx);
      return 'committed';
    });

    expect(result).toBe('committed');
    expect(service.client).toBe(service.db);
  });

  it('wires Better Auth drizzleAdapter without schema mismatch', async () => {
    const auth = createAuth(service.db, configuration, mail);
    const context = await auth.$context;
    expect(context.adapter.id).toBe('drizzle');
  });
});
