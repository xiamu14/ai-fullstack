import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { SessionIdentity } from '../src/application/identity/session-identity.js';
import { SessionReader } from '../src/application/identity/session-reader.js';
import { AppModule } from '../src/bootstrap/app.module.js';
import { configureApplication } from '../src/bootstrap/configure-application.js';
import { ConfigurationService } from '../src/infrastructure/config/configuration.service.js';
import { BetterAuthService } from '../src/infrastructure/identity/better-auth.service.js';
import { DatabaseService } from '../src/infrastructure/postgres/database.service.js';

const readSession = vi.fn<SessionReader['read']>();
const configuration = {
  port: 3020,
  rpcPrefix: '/rpc/v1',
  authPath: '/rpc/v1/auth',
  authUrl: 'http://localhost:3020',
  trustedOrigins: ['http://localhost:3020', 'http://localhost:5173'],
};

const renewedCookies = [
  'backend.session_token=renewed; Path=/; HttpOnly; SameSite=Lax',
  'backend.session_data=renewed; Path=/; HttpOnly; SameSite=Lax',
];

describe('Versioned RPC transport', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigurationService)
      .useValue(configuration)
      .overrideProvider(DatabaseService)
      .useValue({})
      .overrideProvider(SessionReader)
      .useValue({ read: readSession })
      .overrideProvider(BetterAuthService)
      .useValue({
        auth: {
          handler: async (incoming: Request) =>
            Response.json(await incoming.json()),
        },
      })
      .compile();
    app = fixture.createNestApplication({ bodyParser: false });
    configureApplication(app);
    await app.init();
  });

  beforeEach(() => {
    readSession.mockReset().mockResolvedValue({ identity: null, cookies: [] });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('redirects the root to Scalar', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Location', '/docs');
  });

  it('serves v1 health directly without a json wrapper with CORS and a request ID', async () => {
    const response = await request(app.getHttpServer())
      .post('/rpc/v1/system/health')
      .send({})
      .set('Origin', 'http://localhost:5173')
      .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'backend',
    });
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('rejects undeclared input and unknown procedures', async () => {
    await request(app.getHttpServer())
      .post('/rpc/v1/system/health')
      .send({ unexpected: true })
      .expect(400);
    const response = await request(app.getHttpServer())
      .post('/rpc/v1/missing')
      .send({})
      .expect(404);
    expect(response.body.code).toBe('NOT_FOUND');
  });

  it('does not expose REST, unversioned RPC, or unsupported version aliases', async () => {
    for (const path of [
      '/api/health',
      '/rpc/system/health',
      '/rpc/v2/system/health',
    ]) {
      await request(app.getHttpServer()).post(path).send({}).expect(404);
    }
    await request(app.getHttpServer()).get('/api/health').expect(404);
    await request(app.getHttpServer()).get('/api/me').expect(404);
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/username')
      .send({})
      .expect(404);
  });

  it('requires a session and forwards cookie cleanup on unauthorized calls', async () => {
    readSession.mockResolvedValue({ identity: null, cookies: renewedCookies });
    const response = await request(app.getHttpServer())
      .post('/rpc/v1/account/me')
      .send({})
      .expect(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
    expect(response.headers['set-cookie']).toEqual(renewedCookies);
  });

  it('maps identity to the account contract and preserves all renewed cookies', async () => {
    const identity: SessionIdentity = {
      user: {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        emailVerified: true,
        username: 'alice',
        image: null,
      },
      session: { id: 'session-1', expiresAt: new Date('2030-01-01T00:00:00Z') },
    };
    readSession.mockResolvedValue({ identity, cookies: renewedCookies });
    const response = await request(app.getHttpServer())
      .post('/rpc/v1/account/me')
      .send({})
      .set('Cookie', 'backend.session_token=signed-token')
      .expect(200);
    expect(readSession).toHaveBeenCalledWith({
      cookie: 'backend.session_token=signed-token',
      authorization: undefined,
    });
    expect(response.body).toEqual({
      user: identity.user,
      session: { id: 'session-1', expiresAt: '2030-01-01T00:00:00.000Z' },
    });
    expect(response.headers['set-cookie']).toEqual(renewedCookies);
  });

  it('mounts native authentication under v1 without pre-parsing its body', async () => {
    const body = { username: 'alice', password: 'test-password' };
    await request(app.getHttpServer())
      .post('/rpc/v1/auth/sign-in/username')
      .send(body)
      .expect(200)
      .expect(body);
  });

  it('documents actual RPC paths and direct JSON schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/openapi.json')
      .expect(200);
    const specification = response.body;
    expect(specification.servers).toEqual([{ url: '/rpc/v1' }]);
    expect(specification.paths['/health']).toBeUndefined();
    const health = specification.paths['/system/health'].post;
    expect(
      health.responses['200'].content['application/json'].schema.properties
        .status,
    ).toBeDefined();
    expect(
      health.responses['200'].content['application/json'].schema.properties
        .json,
    ).toBeUndefined();
    expect(specification.paths['/account/me'].post.security).toEqual([
      { sessionCookie: [] },
    ]);
  });
});
