import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ListingsService } from "../listings.service";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

describe("ListingsService", () => {
  let service: ListingsService;
  let mockPrismaService: any;

  const mockUser = {
    id: "user-001",
    email: "owner@test.com",
    passwordHash: "hash",
    role: "user",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProperty = {
    id: "prop-001",
    title: "Test Property",
    description: "Test description",
    addressId: "addr-001",
    ownerPersonId: "person-001",
    userId: "user-001",
    propertyType: "residential",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 150,
    gardenSize: 50,
    yearBuilt: 2015,
    amenitiesList: ["garage", "garden"],
    metadata: null,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaymentTerms = {
    id: "pt-001",
    type: "onetime",
    currency: "EUR",
    amount: 500000,
    deposit: 50000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockListing = {
    id: "listing-001",
    type: "sale",
    propertyId: "prop-001",
    createdBy: "user-001",
    paymentTermsId: "pt-001",
    status: "draft",
    visibilityStart: null,
    visibilityEnd: null,
    visibilityDays: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    property: mockProperty,
    creator: mockUser,
    paymentTerms: mockPaymentTerms,
  };

  beforeEach(async () => {
    mockPrismaService = {
      property: {
        findUnique: jest.fn(),
      },
      listing: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  describe("create", () => {
    it("should create listing for valid owner", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.listing.create.mockResolvedValue(mockListing);

      const dto = {
        propertyId: "prop-001",
        type: "sale",
        paymentTermsId: "pt-001",
      };

      const result = await service.create("user-001", dto);

      expect(result.id).toEqual("listing-001");
      expect(result.createdBy).toEqual("user-001");
      expect(mockPrismaService.property.findUnique).toHaveBeenCalledWith({
        where: { id: "prop-001" },
      });
    });

    it("should throw NotFoundException when property not found", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);

      const dto = {
        propertyId: "nonexistent",
        type: "sale",
        paymentTermsId: "pt-001",
      };

      await expect(service.create("user-001", dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException on Prisma P2003 error", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
      mockPrismaService.listing.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("FK error", {
          code: "P2003",
          clientVersion: "test",
        }),
      );

      const dto = {
        propertyId: "prop-001",
        type: "sale",
        paymentTermsId: "pt-001",
      };

      await expect(service.create("user-001", dto)).rejects.toThrow(BadRequestException);
    });

    it("should throw ForbiddenException when user does not own property", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const dto = {
        propertyId: "prop-001",
        type: "sale",
        paymentTermsId: "pt-001",
      };

      await expect(service.create("user-002", dto)).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException when type is missing", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const dto = {
        propertyId: "prop-001",
        paymentTermsId: "pt-001",
      };

      await expect(service.create("user-001", dto)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when paymentTermsId is missing", async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

      const dto = {
        propertyId: "prop-001",
        type: "sale",
      };

      await expect(service.create("user-001", dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("findByUser", () => {
    it("should return paginated listings for user", async () => {
      mockPrismaService.listing.findMany.mockResolvedValue([mockListing]);
      mockPrismaService.listing.count.mockResolvedValue(1);

      const result = await service.findByUser("user-001", 0, 10);

      expect(result.listings).toHaveLength(1);
      expect(result.total).toEqual(1);
      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith({
        where: { createdBy: "user-001" },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { property: true, creator: true, paymentTerms: true },
      });
    });

    it("should return empty listings when user has none", async () => {
      mockPrismaService.listing.findMany.mockResolvedValue([]);
      mockPrismaService.listing.count.mockResolvedValue(0);

      const result = await service.findByUser("user-999", 0, 10);

      expect(result.listings).toHaveLength(0);
      expect(result.total).toEqual(0);
    });

    it("should respect skip and take parameters", async () => {
      mockPrismaService.listing.findMany.mockResolvedValue([mockListing]);
      mockPrismaService.listing.count.mockResolvedValue(25);

      await service.findByUser("user-001", 5, 10);

      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith({
        where: { createdBy: "user-001" },
        skip: 5,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { property: true, creator: true, paymentTerms: true },
      });
    });
  });

  describe("findById", () => {
    it("should return listing by id", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);

      const result = await service.findById("listing-001");

      expect(result.id).toEqual("listing-001");
      expect(mockPrismaService.listing.findUnique).toHaveBeenCalledWith({
        where: { id: "listing-001" },
        include: { property: true, creator: true, paymentTerms: true },
      });
    });

    it("should throw NotFoundException when listing not found", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update listing for valid owner", async () => {
      const updatedListing = { ...mockListing, status: "published" };
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);
      mockPrismaService.listing.update.mockResolvedValue(updatedListing);

      const dto = { status: "published" };
      const result = await service.update("listing-001", "user-001", dto);

      expect(result.status).toEqual("published");
      expect(mockPrismaService.listing.update).toHaveBeenCalled();
    });

    it("should throw NotFoundException when listing not found", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(null);

      const dto = { status: "published" };

      await expect(service.update("nonexistent", "user-001", dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);

      const dto = { status: "published" };

      await expect(service.update("listing-001", "user-002", dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("delete", () => {
    it("should delete listing for valid owner", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);
      mockPrismaService.listing.delete.mockResolvedValue(mockListing);

      await service.delete("listing-001", "user-001");

      expect(mockPrismaService.listing.delete).toHaveBeenCalledWith({
        where: { id: "listing-001" },
      });
    });

    it("should throw NotFoundException when listing not found", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(null);

      await expect(service.delete("nonexistent", "user-001")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);

      await expect(service.delete("listing-001", "user-002")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Access Control", () => {
    it("should enforce ownership on update", async () => {
      const otherUserListing = { ...mockListing, createdBy: "user-002" };
      mockPrismaService.listing.findUnique.mockResolvedValue(otherUserListing);

      const dto = { status: "published" };

      await expect(service.update("listing-001", "user-001", dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should enforce ownership on delete", async () => {
      const otherUserListing = { ...mockListing, createdBy: "user-002" };
      mockPrismaService.listing.findUnique.mockResolvedValue(otherUserListing);

      await expect(service.delete("listing-001", "user-001")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("publish", () => {
    it("should publish a listing with custom duration", async () => {
      const publishData = { durationDays: 60 };
      const publishedListing = { ...mockListing, status: "published", publishedAt: new Date() };

      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);
      mockPrismaService.listing.update.mockResolvedValue(publishedListing);

      const result = await service.publish("listing-001", "user-001", publishData);

      expect(result.status).toEqual("published");
      expect(mockPrismaService.listing.update).toHaveBeenCalled();
    });

    it("should publish a listing with custom date range", async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const publishData = { startDate, endDate };
      const publishedListing = { ...mockListing, status: "published" };

      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);
      mockPrismaService.listing.update.mockResolvedValue(publishedListing);

      const result = await service.publish("listing-001", "user-001", publishData);

      expect(result.status).toEqual("published");
    });

    it("should throw ForbiddenException if user doesn't own listing", async () => {
      const otherUserListing = { ...mockListing, createdBy: "user-002" };
      mockPrismaService.listing.findUnique.mockResolvedValue(otherUserListing);

      await expect(
        service.publish("listing-001", "user-001", { durationDays: 30 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("pause", () => {
    it("should pause an active listing", async () => {
      const pausedListing = { ...mockListing, status: "paused" };
      mockPrismaService.listing.findUnique.mockResolvedValue(mockListing);
      mockPrismaService.listing.update.mockResolvedValue(pausedListing);

      const result = await service.pause("listing-001", "user-001");

      expect(result.status).toEqual("paused");
      expect(mockPrismaService.listing.update).toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user doesn't own listing", async () => {
      const otherUserListing = { ...mockListing, createdBy: "user-002" };
      mockPrismaService.listing.findUnique.mockResolvedValue(otherUserListing);

      await expect(service.pause("listing-001", "user-001")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("renew", () => {
    it("should renew a paused listing", async () => {
      const pausedListing = { ...mockListing, status: "paused" };
      const renewedListing = { ...mockListing, status: "published", publishedAt: new Date() };

      mockPrismaService.listing.findUnique.mockResolvedValue(pausedListing);
      mockPrismaService.listing.update.mockResolvedValue(renewedListing);

      const result = await service.renew("listing-001", "user-001", { durationDays: 30 });

      expect(result.status).toEqual("published");
      expect(mockPrismaService.listing.update).toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user doesn't own listing", async () => {
      const otherUserListing = { ...mockListing, createdBy: "user-002" };
      mockPrismaService.listing.findUnique.mockResolvedValue(otherUserListing);

      await expect(service.renew("listing-001", "user-001", { durationDays: 30 })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
