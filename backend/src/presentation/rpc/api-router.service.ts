import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { apiContract } from '../../contracts/v1/api.contract.js';
import type { ApiContext } from './api.context.js';
import { healthRouter } from './health/health.router.js';
import { IdentityRouterService } from './identity/identity-router.service.js';

@Injectable()
export class ApiRouterService {
  readonly router;

  constructor(identity: IdentityRouterService) {
    this.router = implement(apiContract).$context<ApiContext>().router({
      system: healthRouter,
      account: identity.router,
    });
  }
}
