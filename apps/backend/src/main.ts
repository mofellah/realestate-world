import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { logger } from '@boilerplate/logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { logger: ['log', 'error', 'warn', 'debug'] },
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration for development
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  
  await app.listen(port, '0.0.0.0');
  logger.info(`Backend server listening on port ${port}`);
  console.log(`Backend server listening on port ${port}`); // explicit console output for container logs
}

bootstrap().catch((err) => {
  logger.error('Failed to start backend', err);
  process.exit(1);
});
