import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { logger } from '@boilerplate/logger';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    { provide: 'LOGGER', useValue: logger },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
