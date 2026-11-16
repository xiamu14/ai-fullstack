import { implement } from '@orpc/server';
import { healthContract } from '../../../contracts/v1/health/health.contract.js';
import type { ApiContext } from '../api.context.js';

const implementer = implement(healthContract).$context<ApiContext>();

export const healthRouter = implementer.router({
  health: implementer.health.handler(() => ({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  })),
});
