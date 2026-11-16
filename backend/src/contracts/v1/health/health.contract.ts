import { type } from 'arktype';
import { emptyInput, procedure } from '../../shared/procedure.js';

export const healthSchema = type({
  status: "'ok'",
  service: "'backend'",
  timestamp: 'string',
});

export const healthContract = {
  health: procedure
    .route({
      method: 'POST',
      path: '/system/health',
      tags: ['Health'],
      summary: '服务状态',
    })
    .input(emptyInput)
    .output(healthSchema),
};
