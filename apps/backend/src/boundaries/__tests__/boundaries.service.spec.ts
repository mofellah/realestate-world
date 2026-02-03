import { Test, TestingModule } from "@nestjs/testing";
import { BoundariesService } from "../boundaries.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchBoundariesDto } from "../dto/search-boundaries.dto";
import { AutocompleteBoundariesDto } from "../dto/autocomplete-boundaries.dto";

describe("BoundariesService", () => {
  let service: BoundariesService;
  let prisma: PrismaService;

  const mockPrisma = {
    boundary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoundariesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BoundariesService>(BoundariesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should return boundaries with limit", async () => {
      const dto: SearchBoundariesDto = {
        limit: 10,
      };

      const mockBoundaries = [
        {
          id: "1",
          name: "Brussels",
          nameSlug: "brussels",
          boundaryType: {
            code: "municipality",
            name: "Municipality",
            localName: null,
            level: 3,
          },
          country_code: "BE",
          population: 180000,
          area_sqkm: 32.6,
          centroidLat: 50.85,
          centroidLon: 4.35,
          isPopular: true,
          searchRank: 1,
        },
      ];

      mockPrisma.boundary.findMany.mockResolvedValue(mockBoundaries);

      const result = await service.search(dto);

      expect(Array.isArray(result)).toBe(true);
      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should filter by name", async () => {
      const dto: SearchBoundariesDto = {
        name: "Brussels",
        limit: 10,
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should filter by typeCode", async () => {
      const dto: SearchBoundariesDto = {
        typeCode: "municipality",
        limit: 10,
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should search with proximity (lat/lon/radius)", async () => {
      const dto: SearchBoundariesDto = {
        lat: 50.85,
        lon: 4.35,
        radius: 25,
        limit: 10,
      };

      const mockBoundaries = [
        {
          id: "1",
          name: "Brussels",
          nameSlug: "brussels",
          boundaryType: {
            code: "municipality",
            name: "Municipality",
            localName: null,
            level: 3,
          },
          country_code: "BE",
          population: 180000,
          area_sqkm: 32.6,
          centroidLat: 50.85,
          centroidLon: 4.35,
          isPopular: true,
          searchRank: 1,
        },
      ];

      mockPrisma.boundary.findMany.mockResolvedValue(mockBoundaries);

      await service.search(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should search with bounding box", async () => {
      const dto: SearchBoundariesDto = {
        minLat: 50.8,
        maxLat: 50.9,
        minLon: 4.3,
        maxLon: 4.4,
        limit: 10,
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should filter by country_code", async () => {
      const dto: SearchBoundariesDto = {
        country_code: "BE",
        limit: 10,
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });
  });

  describe("autocomplete", () => {
    it("should return autocomplete suggestions", async () => {
      const dto: AutocompleteBoundariesDto = {
        query: "Brus",
      };

      const mockResults = [
        {
          id: "1",
          name: "Brussels",
          nameSlug: "brussels",
          boundaryType: {
            code: "municipality",
            name: "Municipality",
            localName: null,
            level: 3,
          },
          country_code: "BE",
          population: 180000,
          area_sqkm: 32.6,
          centroidLat: 50.85,
          centroidLon: 4.35,
          isPopular: true,
          searchRank: 1,
        },
      ];

      mockPrisma.boundary.findMany.mockResolvedValue(mockResults);

      const result = await service.autocomplete(dto);

      expect(result).toEqual(mockResults);
    });

    it("should filter by typeCode in autocomplete", async () => {
      const dto: AutocompleteBoundariesDto = {
        query: "Brus",
        typeCode: "municipality",
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.autocomplete(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });

    it("should filter by country_code in autocomplete", async () => {
      const dto: AutocompleteBoundariesDto = {
        query: "Brus",
        country_code: "BE",
      };

      mockPrisma.boundary.findMany.mockResolvedValue([]);

      await service.autocomplete(dto);

      expect(mockPrisma.boundary.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return boundary by id", async () => {
      const mockBoundary = {
        id: "1",
        name: "Brussels",
        nameSlug: "brussels",
        boundaryType: {
          code: "municipality",
          name: "Municipality",
          localName: null,
          level: 3,
        },
        country_code: "BE",
        population: 180000,
        area_sqkm: 32.6,
        centroidLat: 50.85,
        centroidLon: 4.35,
        isPopular: true,
        searchRank: 1,
      };

      mockPrisma.boundary.findUnique.mockResolvedValue(mockBoundary);

      const result = await service.findById("1");

      expect(result).toEqual(mockBoundary);
      expect(mockPrisma.boundary.findUnique).toHaveBeenCalled();
    });
  });
});
