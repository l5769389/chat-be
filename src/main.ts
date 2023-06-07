import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';

const {
  http: { host, port },
} = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // httpsOptions: {
    //   key: readFileSync(join(__dirname, '/config/localhost-key.pem')),
    //   cert: readFileSync(join(__dirname, '/config/localhost.pem')),
    // },
  });
  app.enableCors();
  await app.listen(port, host);
}

bootstrap();
