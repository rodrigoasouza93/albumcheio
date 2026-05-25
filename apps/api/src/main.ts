import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';

import { AppModule } from './modules/app.module.js';

const DEFAULT_API_PORT = 3001;

const getApiPort = (): number => {
  const parsedPort = Number(process.env.API_PORT);

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return DEFAULT_API_PORT;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000'
  });

  await app.listen(getApiPort());
}

void bootstrap();
