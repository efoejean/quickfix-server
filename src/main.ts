import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: [
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:5173',
      'http://localhost:5174',
      'exp://127.0.0.1:8081',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 QuickFix API running on http://localhost:${port}`);
}

bootstrap();
