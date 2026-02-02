import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "../admin.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("AdminService", () => {
  let service: AdminService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      property: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      listing: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      paymentTerms: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe("getMetrics", () => {
    it("should return metrics with revenue calculation", async () => {
      mockPrismaService.user.count.mockResolvedValue(100);
      mockPrismaService.property.count.mockResolvedValue(250);
      mockPrismaService.listing.count
        .mockResolvedValueOnce(150) // total listings
        .mockResolvedValueOnce(100); // active listings
      mockPrismaService.paymentTerms.findMany.mockResolvedValue([
        {
          id: "1",
          periodicPayment: { amountPerPeriod: 1000 },
          onetimePayment: null,
        },
        {
          id: "2",
          periodicPayment: null,
          onetimePayment: { amount: 500 },
        },
      ]);

      const result = await service.getMetrics();

      expect(result).toHaveProperty("totalUsers", 100);
      expect(result).toHaveProperty("totalProperties", 250);
      expect(result).toHaveProperty("totalListings", 150);
      expect(result).toHaveProperty("activeListings", 100);
      expect(result).toHaveProperty("revenue", 1500);
    });
  });

  describe("getActivity", () => {
    it("should return recent activity sorted by timestamp", async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: "u1",
          email: "test@example.com",
          createdAt: new Date("2024-01-01"),
        },
      ]);

      mockPrismaService.property.findMany.mockResolvedValue([
        {
          id: "p1",
          propertyType: "house",
          createdAt: new Date("2024-01-02"),
        },
      ]);

      mockPrismaService.listing.findMany.mockResolvedValue([
        {
          id: "l1",
          type: "rent",
          createdAt: new Date("2024-01-03"),
        },
      ]);

      const result = await service.getActivity(10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty("type", "listing_published");
      expect(result[1]).toHaveProperty("type", "property_created");
      expect(result[2]).toHaveProperty("type", "user_registered");
    });

    it("should respect limit parameter", async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.property.findMany.mockResolvedValue([]);
      mockPrismaService.listing.findMany.mockResolvedValue([]);

      await service.getActivity(5);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });
});
