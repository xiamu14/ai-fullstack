import { Injectable } from '@nestjs/common';
import {
  SessionReader,
  type SessionCredentials,
  type SessionReadResult,
} from '../../application/identity/session-reader.js';
import { ConfigurationService } from '../config/configuration.service.js';
import { MailService } from '../mail/mail.service.js';
import { DatabaseService } from '../postgres/database.service.js';
import { createAuth } from './better-auth.factory.js';

@Injectable()
export class BetterAuthService extends SessionReader {
  readonly auth;

  constructor(
    database: DatabaseService,
    configuration: ConfigurationService,
    mail: MailService,
  ) {
    super();
    this.auth = createAuth(database.db, configuration, mail);
  }

  async read(credentials: SessionCredentials): Promise<SessionReadResult> {
    const headers = new Headers();
    if (credentials.cookie) headers.set('cookie', credentials.cookie);
    if (credentials.authorization)
      headers.set('authorization', credentials.authorization);
    const { headers: responseHeaders, response: session } =
      await this.auth.api.getSession({
        headers,
        returnHeaders: true,
      });
    return {
      cookies: responseHeaders.getSetCookie(),
      identity: session
        ? {
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              emailVerified: session.user.emailVerified,
              username: session.user.username ?? null,
              image: session.user.image ?? null,
            },
            session: {
              id: session.session.id,
              expiresAt: session.session.expiresAt,
            },
          }
        : null,
    };
  }
}
