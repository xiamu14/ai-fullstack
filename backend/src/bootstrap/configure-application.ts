import type { INestApplication } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { ConfigurationService } from '../infrastructure/config/configuration.service.js';
import { BetterAuthService } from '../infrastructure/identity/better-auth.service.js';
import { configureHttp } from '../presentation/http/configure-http.js';

export function configureApplication(app: INestApplication): void {
  const configuration = app.get(ConfigurationService);
  const authentication = app.get(BetterAuthService);
  configureHttp(app, {
    rpcPrefix: configuration.rpcPrefix,
    authPath: configuration.authPath,
    trustedOrigins: configuration.trustedOrigins,
    authHandler: toNodeHandler(authentication.auth),
  });
}
