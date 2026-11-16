import { Logger } from '@nestjs/common';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { ORPCError, onError } from '@orpc/server';
import { BodyLimitPlugin } from '@orpc/server/node';
import {
  RequestHeadersPlugin,
  ResponseHeadersPlugin,
} from '@orpc/server/plugins';
import type { Request, Response } from 'express';
import type { ApiContext } from './api.context.js';
import type { ApiRouterService } from './api-router.service.js';

export class ApiTransportService {
  private readonly logger = new Logger(ApiTransportService.name);
  private readonly handler: OpenAPIHandler<ApiContext>;

  constructor(
    api: ApiRouterService,
    private readonly prefix: `/${string}`,
  ) {
    this.handler = new OpenAPIHandler(api.router, {
      plugins: [
        new BodyLimitPlugin<ApiContext>({ maxBodySize: 1024 * 1024 }),
        new RequestHeadersPlugin<ApiContext>(),
        new ResponseHeadersPlugin<ApiContext>(),
      ],
      interceptors: [
        onError((error) => {
          if (!(error instanceof ORPCError) || error.status >= 500) {
            this.logger.error('RPC request failed');
          }
        }),
      ],
    });
  }

  async handle(
    request: Request,
    response: Response,
    context: ApiContext,
  ): Promise<void> {
    const result = await this.handler.handle(request, response, {
      prefix: this.prefix,
      context,
    });
    if (!result.matched) {
      const error = new ORPCError('NOT_FOUND', { message: '接口不存在' });
      response.status(error.status).json(error.toJSON());
    }
  }
}
