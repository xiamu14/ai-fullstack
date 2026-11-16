import type { SessionIdentity } from '../../../application/identity/session-identity.js';
import type { CurrentAccount } from '../../../contracts/v1/identity/identity.contract.js';

export function currentAccount(identity: SessionIdentity): CurrentAccount {
  return {
    user: {
      id: identity.user.id,
      name: identity.user.name,
      email: identity.user.email,
      emailVerified: identity.user.emailVerified,
      username: identity.user.username,
      image: identity.user.image,
    },
    session: {
      id: identity.session.id,
      expiresAt: identity.session.expiresAt.toISOString(),
    },
  };
}
