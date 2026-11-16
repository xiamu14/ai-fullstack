import { type } from 'arktype';
import { emptyInput, procedure } from '../../shared/procedure.js';

export const currentAccountSchema = type({
  user: {
    id: 'string > 0',
    name: 'string',
    email: 'string.email',
    emailVerified: 'boolean',
    username: 'string | null',
    image: 'string | null',
  },
  session: {
    id: 'string > 0',
    expiresAt: 'string',
  },
});

export const identityContract = {
  me: procedure
    .route({
      method: 'POST',
      path: '/account/me',
      tags: ['Identity'],
      summary: '当前登录用户',
      spec: (operation) => ({
        ...operation,
        security: [{ sessionCookie: [] }],
      }),
    })
    .input(emptyInput)
    .output(currentAccountSchema),
};

export type CurrentAccount = typeof currentAccountSchema.infer;
