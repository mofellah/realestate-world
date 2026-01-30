import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from '../messages.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    subject: {
      findUnique: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'LOGGER',
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message successfully', async () => {
      const senderId = 'user-001';
      const dto = {
        recipientId: 'user-002',
        subjectId: 'prop-001',
        subjectType: 'property' as const,
        body: 'Test message',
      };

      const mockRecipient = { id: 'user-002', email: 'recipient@test.com' };
      const mockMessage = {
        id: 'msg-001',
        senderId,
        recipientId: dto.recipientId,
        subjectId: dto.subjectId,
        subjectType: dto.subjectType,
        body: dto.body,
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.subject.findUnique.mockResolvedValue({ id: 'subject-001', subjectType: 'PROPERTY' });
      mockPrismaService.message.create.mockResolvedValue(mockMessage);

      const result = await service.create(senderId, dto);

      expect(result).toEqual(mockMessage);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.recipientId },
      });
      expect(prisma.message.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if recipient not found', async () => {
      const dto = {
        recipientId: 'user-002',
        subjectId: 'prop-001',
        subjectType: 'property' as const,
        body: 'Test message',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create('user-001', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if subject not found', async () => {
      const dto = {
        recipientId: 'user-002',
        subjectId: 'prop-001',
        subjectType: 'property' as const,
        body: 'Test message',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-002' });
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(service.create('user-001', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all messages for user', async () => {
      const userId = 'user-001';
      const mockMessages = [
        {
          id: 'msg-001',
          senderId: 'user-002',
          recipientId: userId,
          body: 'Test message',
          read: false,
        },
      ];

      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);
      mockPrismaService.message.count.mockResolvedValue(mockMessages.length);

      const result = await service.findAll(userId, {});

      expect(result).toEqual({ messages: mockMessages, total: mockMessages.length });
      expect(prisma.message.findMany).toHaveBeenCalled();
    });

    it('should filter by unread messages', async () => {
      const userId = 'user-001';
      const mockMessages = [
        {
          id: 'msg-001',
          recipientId: userId,
          read: false,
        },
      ];

      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);
      mockPrismaService.message.count.mockResolvedValue(mockMessages.length);

      await service.findAll(userId, { isRead: false });

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRead: false,
          }),
        })
      );
    });

    it('should filter by subjectId', async () => {
      const userId = 'user-001';
      const subjectId = 'prop-001';

      mockPrismaService.message.findMany.mockResolvedValue([]);
      mockPrismaService.message.count.mockResolvedValue(0);

      await service.findAll(userId, { subjectId });

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjectId,
          }),
        })
      );
    });

    it('should filter by threadId', async () => {
      const userId = 'user-001';
      const threadId = 'thread-001';

      mockPrismaService.message.findMany.mockResolvedValue([]);
      mockPrismaService.message.count.mockResolvedValue(0);

      await service.findAll(userId, { threadId });

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            threadId,
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const userId = 'user-001';
      const mockMessage = {
        id: 'msg-001',
        recipientId: userId,
        senderId: 'user-002',
        body: 'Test message',
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

      const result = await service.findOne('msg-001', userId);

      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException if message not found', async () => {
      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-001')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException if not sender or recipient', async () => {
      const mockMessage = {
        id: 'msg-001',
        recipientId: 'user-002',
        senderId: 'user-003',
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

      await expect(service.findOne('msg-001', 'user-001')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should auto-mark as read for recipient', async () => {
      const userId = 'user-001';
      const mockMessage = {
        id: 'msg-001',
        recipientId: userId,
        senderId: 'user-002',
        isRead: false,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
      jest.spyOn(service, 'markAsRead').mockResolvedValue(undefined as any);

      const result = await service.findOne('msg-001', userId);

      expect(service.markAsRead).toHaveBeenCalledWith('msg-001', userId);
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const userId = 'user-001';
      const mockMessage = {
        id: 'msg-001',
        recipientId: userId,
        read: false,
      };

      const mockUpdated = { ...mockMessage, read: true };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.message.update.mockResolvedValue(mockUpdated);

      await service.markAsRead('msg-001', userId);

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: 'msg-001' },
        data: { isRead: true },
      });
    });

    it('should throw ForbiddenException if not recipient', async () => {
      const mockMessage = {
        id: 'msg-001',
        recipientId: 'user-002',
        senderId: 'user-003',
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

      await expect(service.markAsRead('msg-001', 'user-001')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('findThread', () => {
    it('should return messages in a thread', async () => {
      const userId = 'user-001';
      const threadId = 'thread-001';
      const mockMessages = [
        { id: 'msg-001', threadId, recipientId: userId },
        { id: 'msg-002', threadId, senderId: userId },
      ];

      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);

      const result = await service.findThread(threadId, userId);

      expect(result).toEqual(mockMessages);
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            threadId,
          }),
        })
      );
    });

    it('should throw NotFoundException when thread is empty', async () => {
      const userId = 'user-001';
      const threadId = 'thread-001';

      mockPrismaService.message.findMany.mockResolvedValue([]);

      await expect(service.findThread(threadId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
