import { Module } from '@nestjs/common';
import { ConfigurationService } from '../../infrastructure/config/configuration.service.js';
import { ApiDocumentationService } from '../../presentation/openapi/api-documentation.service.js';
import { ApiRouterService } from '../../presentation/rpc/api-router.service.js';
import { ApiTransportService } from '../../presentation/rpc/api-transport.service.js';
import { ConfigurationModule } from './configuration.module.js';
import { IdentityModule } from './identity.module.js';

@Module({
  imports: [ConfigurationModule, IdentityModule],
  providers: [
    ApiRouterService,
    {
      provide: ApiTransportService,
      inject: [ApiRouterService, ConfigurationService],
      useFactory: (
        api: ApiRouterService,
        configuration: ConfigurationService,
      ) => new ApiTransportService(api, configuration.rpcPrefix),
    },
    {
      provide: ApiDocumentationService,
      inject: [ConfigurationService],
      useFactory: (configuration: ConfigurationService) =>
        new ApiDocumentationService({
          prefix: configuration.rpcPrefix,
          sessionCookieName:
            new URL(configuration.authUrl).protocol === 'https:'
              ? '__Secure-backend.session_token'
              : 'backend.session_token',
        }),
    },
  ],
  exports: [ApiTransportService, ApiDocumentationService],
})
export class RpcModule {}
