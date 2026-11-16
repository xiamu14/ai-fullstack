import type { SessionIdentity } from './session-identity.js';

export interface SessionCredentials {
  readonly cookie?: string;
  readonly authorization?: string;
}

export interface SessionReadResult {
  readonly identity: SessionIdentity | null;
  readonly cookies: readonly string[];
}

export abstract class SessionReader {
  abstract read(credentials: SessionCredentials): Promise<SessionReadResult>;
}
