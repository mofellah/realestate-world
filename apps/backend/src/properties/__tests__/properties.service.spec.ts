import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PropertiesService } from '../properties.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  const mockUser = {
    id: 'user-001',
    email: 'owner@test.com',
    passwordHash: 'hash',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    person: {
      id: 'person-001',
      email: 'owner@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockProperty = {
    id: 'prop-001',
    title: 'Test Property',
    description: 'Test description',
    addressId: 'addr-001',
    ownerPersonId: 'person-001',
    userId: 'user-001',
    propertyType: 'residential',
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 150,
    gardenSize: 50,
    yearBuilt: 2015,
    amenitiesList: ['garage', 'garden'],
    metadata: null,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    address: { id: 'addr-001', city: 'Brussels' },
    user: mockUser,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockRequest = {
      correlationId: 'test-correlation-id',
      headers: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);

    // Reset mocks after each test
    Object.values(mockPrismaService).forEach(mock => {
      if (typeof mock === 'object') {
        Object.values(mock).forEach(method => {
          if (typeof method === 'function') {
            (method as jest.Mock).mockClear();
          }
        });
      }
    });
  });

  describe('create', () => {
    it('should create property for valid user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.property.create.mockResolvedValue(mockProperty);

      const dto = {
        title: 'Test Property',
        addressId: 'cltestaddr1234567890001',
        description: 'Test',
      };

      const result = await service.create('user-001', dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('prop-001');
      expect(mockPrismaService.property.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid addressId CUID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.create('invalid-user', { title: 'Test', addressId: 'invalid-cuid' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if title missing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create('user-001', { addressId: 'addr-001', title: 'Test' })).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if addressId missing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create('user-001', { title: 'Test' } as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if user person missing', async () => {
      const userWithoutPerson = { ...mockUser, person: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPerson);

      await expect(service.create('user-001', { title: 'Test', addressId: 'addr-001' })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findByUser', () => {
    it('should return user properties with pagination', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([mockProperty]);
      mockPrismaService.property.count.mockResolvedValue(1);

      const result = await service.findByUser('user-001', 0, 10);

      expect(result.properties).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return empty array for user with no properties', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([]);
      mockPrismaService.property.count.mockResolvedValue(0);

      const result = await service.findByUser('user-001');

      expect(result.properties).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should respect skip and take parameters', async () => {
      mockPrismaService.property.findMany.mockResolvedValue([mockProperty]);
      mockPrismaService.property.count.mockResolvedValue(100);

      await service.findByUser('user-001', 20, 5);

      expect(mockPrismaService.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 5,
        })
      );
    });
  });

  describe('findById', () => {
    it('should return property by id', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findById('prop-001');

      expect(result).toBeDefined();
      expect(result.id).toBe('prop-001');
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update property for owner', async () => {
      const updatedProperty = { ...mockProperty, title: 'Updated Title' };
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.update.mockResolvedValue(updatedProperty);

      const result = await service.update('prop-001', 'user-001', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid', 'user-001', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not owner', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.update('prop-001', 'other-user', {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete property for owner', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.property.delete.mockResolvedValue(mockProperty);

      await service.delete('prop-001', 'user-001');

      expect(mockPrismaService.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-001' },
      });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      await expect(service.delete('invalid', 'user-001')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not owner', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.delete('prop-001', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('access control', () => {
    it('should enforce ownership for update', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.update('prop-001', 'unauthorized-user', {})).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should enforce ownership for delete', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      await expect(service.delete('prop-001', 'unauthorized-user')).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
