import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
console.log(__dirname);
const {
  http: { port },
} = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync(join(__dirname, '/config/rootCA.pem')),
      cert: readFileSync(join(__dirname, '/config/rootCA-key.pem')),
    },
  });
  app.enableCors();
  await app.listen(port);
}

bootstrap();
