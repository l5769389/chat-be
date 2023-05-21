import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

const {
  http: { host, port },
} = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync(join(__dirname, '/config/local-key.pem')),
      cert: readFileSync(join(__dirname, '/config/local.pem')),
    },
  });
  app.enableCors();
  await app.listen(port, host);
}

bootstrap();
