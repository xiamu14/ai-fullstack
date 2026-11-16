import { NestFactory } from '@nestjs/core';
import { AppModule } from './bootstrap/app.module.js';
import { configureApplication } from './bootstrap/configure-application.js';
import { ConfigurationService } from './infrastructure/config/configuration.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableShutdownHooks();
  configureApplication(app);
  await app.listen(app.get(ConfigurationService).port);
}

await bootstrap();
