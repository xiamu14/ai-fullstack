import { Logger, type INestApplication } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { apiReference } from '@scalar/express-api-reference';
import type { Express, NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { ApiDocumentationService } from '../openapi/api-documentation.service.js';
import { ApiTransportService } from '../rpc/api-transport.service.js';

export interface HttpOptions {
  rpcPrefix: `/${string}`;
  authPath: `/${string}`;
  trustedOrigins: string[];
  authHandler: (request: Request, response: Response) => Promise<void>;
}

function within(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function configureHttp(
  app: INestApplication,
  options: HttpOptions,
): void {
  const server: Express = app.getHttpAdapter().getInstance();
  const api = app.get(ApiTransportService);
  const documentation = app.get(ApiDocumentationService);
  const logger = new Logger('HttpTransport');

  app.getHttpAdapter().enableCors({
    origin: options.trustedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  server.use((request: Request, response: Response, next: NextFunction) => {
    const incoming = request.header('x-request-id');
    response.setHeader(
      'X-Request-Id',
      incoming && /^[\w-]{1,128}$/.test(incoming) ? incoming : randomUUID(),
    );
    next();
  });

  server.use((request: Request, response: Response, next: NextFunction) => {
    if (!within(request.path, options.authPath)) return next();
    void options.authHandler(request, response).catch(next);
  });

  server.get('/openapi.json', (_request, response, next) => {
    void documentation
      .getSpecification()
      .then((specification) => response.json(specification))
      .catch(next);
  });

  server.use(
    '/docs',
    apiReference({
      pageTitle: 'Backend API',
      sources: [
        { title: '应用接口 v1', slug: 'rpc-v1', url: '/openapi.json' },
        {
          title: '身份认证 v1',
          slug: 'auth-v1',
          url: `${options.authPath}/open-api/generate-schema`,
        },
      ],
    }),
  );

  server.use((request: Request, response: Response, next: NextFunction) => {
    if (!within(request.path, options.rpcPrefix)) return next();
    void api
      .handle(request, response, {
        requestId: String(response.getHeader('X-Request-Id')),
      })
      .catch(next);
  });

  server.use(
    (
      error: unknown,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (response.headersSent) return next(error);
      const failure =
        error instanceof ORPCError
          ? error
          : new ORPCError('INTERNAL_SERVER_ERROR', {
              message: '服务暂时不可用',
            });
      if (failure.status >= 500) {
        logger.error({
          event: 'http.request_failed',
          requestId: response.getHeader('X-Request-Id'),
        });
      }
      response.status(failure.status).json(failure.toJSON());
    },
  );
}
