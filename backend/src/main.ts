import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });
  await app.listen(process.env.PORT ?? 4000);
  console.log(`HR API running on http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();
