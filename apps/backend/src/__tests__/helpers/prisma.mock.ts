/**
 * Prisma Mock Helpers
 * 
 * Provides utilities for mocking PrismaService in tests.
 * These helpers set up proper mocks for database operations.
 */

import { PrismaService } from '../../prisma/prisma.service';

/**
 * Create a fully mocked PrismaService
 * Includes mocked methods for common operations on all models
 * @returns Jest mocked PrismaClient
 */
export function createMockPrismaClient(): jest.Mocked<PrismaService> {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    listing: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    agency: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    message: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  } as any;
}

/**
 * Setup a mock for the findUnique operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param returnValue - The value to return when findUnique is called
 */
export function mockFindUnique<T>(model: any, returnValue: T): jest.Mock {
  return (model.findUnique = jest.fn().mockResolvedValue(returnValue));
}

/**
 * Setup a mock for the findMany operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param returnValue - The values to return when findMany is called
 */
export function mockFindMany<T>(model: any, returnValue: T[]): jest.Mock {
  return (model.findMany = jest.fn().mockResolvedValue(returnValue));
}

/**
 * Setup a mock for the create operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param returnValue - The created entity to return
 */
export function mockCreate<T>(model: any, returnValue: T): jest.Mock {
  return (model.create = jest.fn().mockResolvedValue(returnValue));
}

/**
 * Setup a mock for the update operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param returnValue - The updated entity to return
 */
export function mockUpdate<T>(model: any, returnValue: T): jest.Mock {
  return (model.update = jest.fn().mockResolvedValue(returnValue));
}

/**
 * Setup a mock for the delete operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param returnValue - The deleted entity to return
 */
export function mockDelete<T>(model: any, returnValue: T): jest.Mock {
  return (model.delete = jest.fn().mockResolvedValue(returnValue));
}

/**
 * Setup a mock for the count operation on a model
 * @param model - The model object to mock (e.g., prismaService.user)
 * @param count - The count to return
 */
export function mockCount(model: any, count: number): jest.Mock {
  return (model.count = jest.fn().mockResolvedValue(count));
}

/**
 * Reset all mocks on a model
 * @param model - The model to reset
 */
export function resetModelMocks(model: any): void {
  Object.values(model).forEach((method: any) => {
    if (typeof method === 'function' && method.mockReset) {
      method.mockReset();
    }
  });
}

/**
 * Reset all mocks in a Prisma client
 * @param prismaService - The mocked PrismaService
 */
export function resetAllMocks(prismaService: jest.Mocked<PrismaService>): void {
  Object.values(prismaService).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      resetModelMocks(model);
    }
  });
}