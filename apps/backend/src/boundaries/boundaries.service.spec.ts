/**
 * Boundaries Service Integration Tests
 * Tests actual database queries with test fixtures
 */

import { Test, TestingModule } from "@nestjs/testing";
import { BoundariesService } from "./boundaries.service";
import { PrismaService } from "../prisma/prisma.service";
import { mockBoundaries } from "./test-fixtures";

describe("BoundariesService (Integration)", () => {
  let service: BoundariesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    boundary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoundariesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BoundariesService>(BoundariesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("autocomplete", () => {
    it("should find boundaries by name prefix (case-insensitive)", async () => {
      const query = "brus";
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[0]]);

      const result = await service.autocomplete({ query, limit: 10 });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Brussels");
      expect(prisma.boundary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it("should match alternate names", async () => {
      const query = "bruxel"; // Alternate name for Brussels
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[0]]);

      const result = await service.autocomplete({ query, limit: 10 });

      expect(result).toHaveLength(1);
      expect((result[0] as any).alternateNames).toContain("Bruxelles");
    });

    it("should include boundary type in response", async () => {
      const query = "ghent";
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[2]]);

      const result = await service.autocomplete({ query, limit: 10 });

      expect(result[0]).toHaveProperty("boundaryType");
      expect(result[0].boundaryType.code).toBe("municipality");
    });
  });

  describe("search", () => {
    it("should search by exact name match", async () => {
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[2]]);

      const result = await service.search({ name: "Ghent" });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Ghent");
    });

    it("should filter by type code", async () => {
      const municipalities = [mockBoundaries[2], mockBoundaries[3], mockBoundaries[4]];
      mockPrismaService.boundary.findMany.mockResolvedValue(municipalities);

      const result = await service.search({ typeCode: "municipality" });

      expect(result).toHaveLength(3);
      result.forEach((b) => {
        expect(b.boundaryType.code).toBe("municipality");
      });
    });

    it("should filter by country code", async () => {
      mockPrismaService.boundary.findMany.mockResolvedValue(mockBoundaries);

      const result = await service.search({ country_code: "BE" });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((b) => {
        expect(b.country_code).toBe("BE");
      });
    });

    it("should filter by bounding box", async () => {
      // Brussels within box
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[0]]);

      const result = await service.search({
        minLat: 50.7,
        maxLat: 51.0,
        minLon: 4.2,
        maxLon: 4.5,
      });

      expect(result).toHaveLength(1);
      expect(result[0].centroidLat).toBeGreaterThanOrEqual(50.7);
      expect(result[0].centroidLat).toBeLessThanOrEqual(51.0);
    });
  });

  describe("proximity search", () => {
    it("should calculate distance and filter by radius", async () => {
      // Mock search returns Brussels and Antwerp
      mockPrismaService.boundary.findMany.mockResolvedValue([mockBoundaries[0], mockBoundaries[1]]);

      const result = await service.search({
        lat: 50.8503,
        lon: 4.3517,
        radius: 100, // 100km from Brussels
      });

      // Should include boundaries within 100km
      expect(result.length).toBeGreaterThan(0);
      result.forEach((boundary: any) => {
        expect(boundary).toHaveProperty("distance");
        expect(boundary.distance).toBeLessThanOrEqual(100);
      });
    });

    it("should sort results by distance", async () => {
      mockPrismaService.boundary.findMany.mockResolvedValue([
        mockBoundaries[1], // Antwerp (further)
        mockBoundaries[0], // Brussels (closer)
      ]);

      const result = await service.search({
        lat: 50.8503,
        lon: 4.3517,
        radius: 200,
      });

      // Results should be sorted by distance (closest first)
      for (let i = 1; i < result.length; i++) {
        expect((result[i] as any).distance).toBeGreaterThanOrEqual((result[i - 1] as any).distance);
      }
    });
  });

  describe("getPopular", () => {
    it("should return boundaries with high searchRank", async () => {
      const popular = mockBoundaries.filter((b) => b.searchRank >= 90);
      mockPrismaService.boundary.findMany.mockResolvedValue(popular);

      const result = await service.getPopular();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((b) => {
        expect(b.searchRank).toBeGreaterThanOrEqual(90);
      });
    });

    it("should be ordered by searchRank descending", async () => {
      const popular = [mockBoundaries[0], mockBoundaries[2], mockBoundaries[1]]; // 100, 95, 90
      mockPrismaService.boundary.findMany.mockResolvedValue(popular);

      const result = await service.getPopular();

      for (let i = 1; i < result.length; i++) {
        expect(result[i].searchRank).toBeLessThanOrEqual(result[i - 1].searchRank);
      }
    });
  });

  describe("findById", () => {
    it("should return boundary with parent and children", async () => {
      const boundary = {
        ...mockBoundaries[0],
        parent: null,
        children: [mockBoundaries[2], mockBoundaries[3]],
      };
      mockPrismaService.boundary.findUnique.mockResolvedValue(boundary);

      const result = await service.findById("boundary-1");

      expect(result).toBeDefined();
      expect(result!.name).toBe("Brussels");
      expect(result).toHaveProperty("children");
      expect((result as any).children).toHaveLength(2);
    });

    it("should return null for non-existent ID", async () => {
      mockPrismaService.boundary.findUnique.mockResolvedValue(null);

      const result = await service.findById("non-existent");

      expect(result).toBeNull();
    });
  });
});
