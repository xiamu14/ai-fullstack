import { Module } from '@nestjs/common';
import { SessionReader } from '../../application/identity/session-reader.js';
import { BetterAuthService } from '../../infrastructure/identity/better-auth.service.js';
import { MailService } from '../../infrastructure/mail/mail.service.js';
import { IdentityRouterService } from '../../presentation/rpc/identity/identity-router.service.js';
import { ConfigurationModule } from './configuration.module.js';
import { DatabaseModule } from './database.module.js';

@Module({
  imports: [ConfigurationModule, DatabaseModule],
  providers: [
    MailService,
    BetterAuthService,
    { provide: SessionReader, useExisting: BetterAuthService },
    IdentityRouterService,
  ],
  exports: [BetterAuthService, IdentityRouterService],
})
export class IdentityModule {}
