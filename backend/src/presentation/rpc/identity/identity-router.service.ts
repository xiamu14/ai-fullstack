import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { SessionReader } from '../../../application/identity/session-reader.js';
import { identityContract } from '../../../contracts/v1/identity/identity.contract.js';
import type { ApiContext } from '../api.context.js';
import { authenticated } from '../auth.middleware.js';
import { currentAccount } from './current-account.presenter.js';

@Injectable()
export class IdentityRouterService {
  readonly router;

  constructor(sessions: SessionReader) {
    const implementer = implement(identityContract).$context<ApiContext>();
    this.router = implementer.router({
      me: implementer.me
        .use(authenticated(sessions))
        .handler(({ context }) => currentAccount(context.identity)),
    });
  }
}
