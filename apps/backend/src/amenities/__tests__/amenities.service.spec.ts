import { Test, TestingModule } from "@nestjs/testing";
import { AmenitiesService } from "../amenities.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchAmenitiesDto } from "../dto/search-amenities.dto";
import { AutocompleteAmenitiesDto } from "../dto/autocomplete-amenities.dto";

describe("AmenitiesService", () => {
  let service: AmenitiesService;
  let prisma: PrismaService;

  const mockPrisma = {
    amenity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmenitiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AmenitiesService>(AmenitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should return amenities array", async () => {
      const dto: SearchAmenitiesDto = {
        limit: 10,
      };

      const mockAmenities = [
        {
          id: "1",
          name: "Test School",
          type: "school" as any,
          address: "123 Main St",
          city: "Brussels",
          phone: null,
          website: null,
          openingHours: null,
          geoObject: {
            latitude: 50.85,
            longitude: 4.35,
          },
        },
      ];

      mockPrisma.amenity.findMany.mockResolvedValue(mockAmenities);

      const result = await service.search(dto);

      expect(Array.isArray(result)).toBe(true);
      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should search with proximity parameters", async () => {
      const dto: SearchAmenitiesDto = {
        lat: 50.8503,
        lon: 4.3517,
        radius: 1000,
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should search with bounding box", async () => {
      const dto: SearchAmenitiesDto = {
        minLat: 50.8,
        maxLat: 50.9,
        minLon: 4.3,
        maxLon: 4.4,
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should filter by type", async () => {
      const dto: SearchAmenitiesDto = {
        type: "school" as any,
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should filter by name", async () => {
      const dto: SearchAmenitiesDto = {
        name: "Central",
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });
  });

  describe("autocomplete", () => {
    it("should return autocomplete suggestions", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "school",
        limit: 5,
      };

      const mockResults = [{ name: "Public School" }, { name: "Private School" }];

      mockPrisma.amenity.findMany.mockResolvedValue(mockResults);

      const result = await service.autocomplete(dto);

      expect(result).toEqual(mockResults);
    });

    it("should apply default limit", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "park",
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.autocomplete(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should filter autocomplete by type", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "School",
        type: "school" as any,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.autocomplete(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should filter autocomplete by city", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "Park",
        city: "Brussels",
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.autocomplete(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return amenity by id", async () => {
      const mockAmenity = {
        id: "1",
        name: "Central Park",
        type: "park" as any,
        address: "123 Main St",
        city: "Brussels",
        phone: null,
        website: null,
        openingHours: null,
        geoObject: {
          latitude: 50.85,
          longitude: 4.35,
        },
      };

      mockPrisma.amenity.findUnique.mockResolvedValue(mockAmenity);

      const result = await service.findById("1");

      expect(result).toBeDefined();
    });

    it("should return null if amenity not found", async () => {
      mockPrisma.amenity.findUnique.mockResolvedValue(null);

      const result = await service.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("search with multiple types", () => {
    it("should filter by multiple types", async () => {
      const dto: SearchAmenitiesDto = {
        types: ["school" as any, "hospital" as any],
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });

    it("should search by city", async () => {
      const dto: SearchAmenitiesDto = {
        city: "Brussels",
        limit: 10,
      };

      mockPrisma.amenity.findMany.mockResolvedValue([]);

      await service.search(dto);

      expect(mockPrisma.amenity.findMany).toHaveBeenCalled();
    });
  });
});
