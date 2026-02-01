/**
 * Users Service Unit Tests
 * Tests for user operations (getCurrentUser, getUserById)
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { UsersService } from "../users.service";
import { PrismaService } from "../../prisma/prisma.service";
import * as fixtures from "../../auth/__tests__/fixtures/auth.fixtures";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user with a single role and no permissions", async () => {
      // Arrange
      const userId = "user-123";
      jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.id).toBe("user-123");
      expect(result.email).toBe("admin@example.com");
      expect(result.roles).toEqual([fixtures.mockUserWithAdminRole.role]);
      expect(result.permissions).toEqual([]);
      expect(result).not.toHaveProperty("passwordHash");
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should throw NotFoundException when user not found", async () => {
      // Arrange
      const userId = "nonexistent-user";
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should return empty roles array when user.role is missing", async () => {
      // Arrange
      const userId = "user-789";
      const mockUserWithoutRole = {
        ...fixtures.mockUserWithAdminRole,
        id: "user-789",
        role: null,
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUserWithoutRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles).toEqual([]);
      expect(result.permissions).toEqual([]);
    });

    it("should allow null user name in response", async () => {
      // Arrange
      const userId = "user-123";
      const mockUserNullName = {
        ...fixtures.mockUserWithAdminRole,
        name: null,
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUserNullName as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.name).toBeNull();
    });

    it("should exclude passwordHash from response", async () => {
      // Arrange
      const userId = "user-456";
      const mockUserWithPassword = {
        ...fixtures.mockUserWithAdminRole,
        id: userId,
        passwordHash: "should-not-be-included",
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUserWithPassword as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).not.toHaveProperty("passwordHash");
      expect(result).not.toHaveProperty("password");
    });

    it("should handle multiple roles", async () => {
      // Arrange
      const userId = "user-multi";
      const mockUserWithRole = {
        ...fixtures.mockUserWithAdminRole,
        id: userId,
        role: "admin",
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUserWithRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      // Service wraps role in array
      expect(result.roles).toEqual(["admin"]);
    });

    it("should call findUnique with correct where clause", async () => {
      // Arrange
      const userId = "specific-user-id";
      jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      await service.getUserById(userId);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string userId", async () => {
      // Arrange
      const userId = "";
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
    });

    it("should handle special characters in userId", async () => {
      // Arrange
      const userId = "user-@#$%^&*";
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should handle very long userId", async () => {
      // Arrange
      const userId = "a".repeat(1000);
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
    });

    it("should handle user with isActive false", async () => {
      // Arrange
      const userId = "inactive-user";
      const mockInactiveUser = {
        ...fixtures.mockUserWithAdminRole,
        id: userId,
        isActive: false,
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockInactiveUser as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.isActive).toBe(false);
    });

    it("should handle user with isActive true", async () => {
      // Arrange
      const userId = "active-user";
      const mockActiveUser = {
        ...fixtures.mockUserWithAdminRole,
        id: userId,
        isActive: true,
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockActiveUser as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.isActive).toBe(true);
    });

    it("should return user without sensitive data", async () => {
      // Arrange
      const userId = "user-999";
      const mockUserSensitiveData = {
        ...fixtures.mockUserWithAdminRole,
        id: userId,
        passwordHash: "hashed-password-should-not-leak",
      };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUserSensitiveData as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).not.toHaveProperty("passwordHash");
    });
  });
});
