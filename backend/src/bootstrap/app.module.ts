import { Module } from '@nestjs/common';
import { DocumentationController } from '../presentation/http/documentation.controller.js';
import { ConfigurationModule } from './modules/configuration.module.js';
import { IdentityModule } from './modules/identity.module.js';
import { RpcModule } from './modules/rpc.module.js';

@Module({
  imports: [ConfigurationModule, IdentityModule, RpcModule],
  controllers: [DocumentationController],
})
export class AppModule {}
