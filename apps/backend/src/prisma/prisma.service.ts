/**
 * Prisma Service for NestJS
 * Handles database connection and client lifecycle
 */

import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@boilerplate/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('info', { service: 'PrismaService' });

  async onModuleInit() {
    await this.$connect();
    this.logger.info('✓ Prisma client connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('✓ Prisma client disconnected');
  }

  async enableShutdownHooks(app: INestApplication) {
    (this.$on as any)('beforeExit', async () => {
      await app.close();
    });
  }
}
