import { implement } from '@orpc/server';
import type { SessionReader } from '../../application/identity/session-reader.js';
import { apiContract } from '../../contracts/v1/api.contract.js';
import type { ApiContext } from './api.context.js';

const implementer = implement(apiContract).$context<ApiContext>();

export function authenticated(sessions: SessionReader) {
  return implementer.middleware(async ({ context, next, errors }) => {
    const headers = context.reqHeaders;
    const result = await sessions.read({
      cookie: headers?.get('cookie') ?? undefined,
      authorization: headers?.get('authorization') ?? undefined,
    });
    for (const cookie of result.cookies) {
      context.resHeaders?.append('set-cookie', cookie);
    }
    if (!result.identity) throw errors.UNAUTHORIZED();
    return next({ context: { identity: result.identity } });
  });
}
