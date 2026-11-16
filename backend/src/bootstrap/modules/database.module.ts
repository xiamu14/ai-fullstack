import { Module } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/postgres/database.service.js';
import { ConfigurationModule } from './configuration.module.js';

@Module({
  imports: [ConfigurationModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
