import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import type { Logger } from 'winston';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {}

  /**
   * Send a new message
   */
  async create(senderId: string, dto: CreateMessageDto) {
    try {
      // Verify recipient exists
      const recipient = await this.prisma.user.findUnique({
        where: { id: dto.recipientId },
      });

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      // If subjectId provided, verify it exists
      if (dto.subjectId) {
        const subject = await this.prisma.subject.findUnique({
          where: { id: dto.subjectId },
        });

        if (!subject) {
          throw new NotFoundException('Subject not found');
        }
      }

      // Create message
      const message = await this.prisma.message.create({
        data: {
          senderId,
          recipientId: dto.recipientId,
          subjectId: dto.subjectId,
          threadId: dto.threadId,
          subject_line: dto.subject_line,
          body: dto.body,
          messageType: (dto.messageType as any) || 'inquiry',
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  email: true,
                  phone: true,
                  physicalPerson: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          recipient: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      this.logger.info(`Message sent from ${senderId} to ${dto.recipientId}`);

      // TODO: Send email notification to recipient
      // this.emailService.sendMessageNotification(recipient.email, message);

      return message;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create message: ${msg}`);
      throw error;
    }
  }

  /**
   * Get user's messages (inbox + sent)
   */
  async findAll(userId: string, query: QueryMessagesDto) {
    const { skip = 0, take = 20, threadId, isRead, subjectId } = query;

    try {
      // Build where clause for received messages
      const where: any = {
        OR: [
          { recipientId: userId },
          { senderId: userId },
        ],
      };

      if (threadId) {
        where.threadId = threadId;
      }

      if (isRead !== undefined) {
        where.isRead = isRead;
        // Only filter by isRead for received messages
        where.recipientId = userId;
        delete where.OR;
      }

      if (subjectId) {
        where.subjectId = subjectId;
      }

      const [messages, total] = await Promise.all([
        this.prisma.message.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                person: {
                  select: {
                    physicalPerson: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            recipient: {
              select: {
                id: true,
                email: true,
              },
            },
            subject: {
              select: {
                id: true,
                subjectType: true,
              },
            },
          },
        }),
        this.prisma.message.count({ where }),
      ]);

      return { messages, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch messages: ${msg}`);
      throw error;
    }
  }

  /**
   * Get single message (if user is sender or recipient)
   */
  async findOne(id: string, userId: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  email: true,
                  phone: true,
                  physicalPerson: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          recipient: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  email: true,
                  phone: true,
                  physicalPerson: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          subject: true,
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      // Verify user is sender or recipient
      if (message.senderId !== userId && message.recipientId !== userId) {
        throw new ForbiddenException('Not authorized to view this message');
      }

      // Auto-mark as read if user is recipient
      if (message.recipientId === userId && !message.isRead) {
        await this.markAsRead(id, userId);
        message.isRead = true;
      }

      return message;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch message ${id}: ${msg}`);
      throw error;
    }
  }

  /**
   * Mark message as read (recipient only)
   */
  async markAsRead(id: string, userId: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      if (message.recipientId !== userId) {
        throw new ForbiddenException('Only recipient can mark message as read');
      }

      await this.prisma.message.update({
        where: { id },
        data: { isRead: true },
      });

      this.logger.info(`Message ${id} marked as read by ${userId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark message as read: ${msg}`);
      throw error;
    }
  }

  /**
   * Get message thread (all messages with same threadId)
   */
  async findThread(threadId: string, userId: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          threadId,
          OR: [
            { senderId: userId },
            { recipientId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  physicalPerson: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          recipient: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (messages.length === 0) {
        throw new NotFoundException('Thread not found or access denied');
      }

      return messages;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch thread ${threadId}: ${msg}`);
      throw error;
    }
  }
}
