/**
 * Boundaries Controller Tests
 * Tests for boundary search endpoints (GET autocomplete, POST search)
 */

import { Test, TestingModule } from "@nestjs/testing";
import { BoundariesController } from "./boundaries.controller";
import { BoundariesService } from "./boundaries.service";
import { mockBoundaries, mockBoundaryTypes } from "./test-fixtures";

describe("BoundariesController", () => {
  let controller: BoundariesController;
  let service: BoundariesService;

  const mockBoundariesService = {
    autocomplete: jest.fn(),
    search: jest.fn(),
    getPopular: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoundariesController],
      providers: [
        {
          provide: BoundariesService,
          useValue: mockBoundariesService,
        },
      ],
    }).compile();

    controller = module.get<BoundariesController>(BoundariesController);
    service = module.get<BoundariesService>(BoundariesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /autocomplete", () => {
    it('should return matching boundaries for query "brus"', async () => {
      const query = "brus";
      const expected = [mockBoundaries[0]]; // Brussels

      mockBoundariesService.autocomplete.mockResolvedValue(expected);

      const result = await controller.autocomplete({ query, limit: 10 });

      expect(result).toEqual(expected);
      expect(service.autocomplete).toHaveBeenCalledWith({ query, limit: 10 });
    });

    it('should return matching boundaries for query "ant"', async () => {
      const query = "ant";
      const expected = [mockBoundaries[1]]; // Antwerp

      mockBoundariesService.autocomplete.mockResolvedValue(expected);

      const result = await controller.autocomplete({ query, limit: 10 });

      expect(result).toEqual(expected);
      expect(service.autocomplete).toHaveBeenCalledWith({ query, limit: 10 });
    });

    it("should filter by country code", async () => {
      const query = "br";
      const country_code = "BE";
      const expected = [mockBoundaries[0], mockBoundaries[3]]; // Brussels, Bruges

      mockBoundariesService.autocomplete.mockResolvedValue(expected);

      const result = await controller.autocomplete({ query, country_code, limit: 10 });

      expect(result).toEqual(expected);
      expect(service.autocomplete).toHaveBeenCalledWith({ query, country_code, limit: 10 });
    });

    it("should limit results", async () => {
      const query = "b";
      const limit = 2;
      const expected = [mockBoundaries[0], mockBoundaries[3]]; // First 2

      mockBoundariesService.autocomplete.mockResolvedValue(expected);

      const result = await controller.autocomplete({ query, limit });

      expect(result).toEqual(expected);
      expect(result).toHaveLength(limit);
    });
  });

  describe("POST /search", () => {
    it("should search by name", async () => {
      const dto = { name: "Brussels" };
      const expected = [mockBoundaries[0]];

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should search by type code", async () => {
      const dto = { typeCode: "municipality" };
      const expected = [mockBoundaries[2], mockBoundaries[3], mockBoundaries[4]]; // Municipalities

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(result.length).toBe(3);
    });

    it("should search by country code", async () => {
      const dto = { country_code: "BE" };
      const expected = mockBoundaries;

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should search by bounding box", async () => {
      const dto = {
        minLat: 50.5,
        maxLat: 51.0,
        minLon: 4.0,
        maxLon: 4.6,
      };
      const expected = [mockBoundaries[0]]; // Brussels within box

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should search by proximity (lat/lon/radius)", async () => {
      const dto = {
        lat: 50.8503,
        lon: 4.3517,
        radius: 50, // 50km from Brussels
      };
      const expected = [mockBoundaries[0], mockBoundaries[1]]; // Brussels and nearby

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should combine multiple filters", async () => {
      const dto = {
        name: "Ghent",
        typeCode: "municipality",
        country_code: "BE",
        limit: 10,
      };
      const expected = [mockBoundaries[2]];

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should apply limit to results", async () => {
      const dto = { country_code: "BE", limit: 3 };
      const expected = mockBoundaries.slice(0, 3);

      mockBoundariesService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toHaveLength(3);
    });
  });

  describe("GET /popular", () => {
    it("should return popular boundaries", async () => {
      const expected = [mockBoundaries[0], mockBoundaries[2]]; // High searchRank

      mockBoundariesService.getPopular.mockResolvedValue(expected);

      const result = await controller.getPopular();

      expect(result).toEqual(expected);
      expect(service.getPopular).toHaveBeenCalledWith(undefined);
    });

    it("should filter popular by country", async () => {
      const country_code = "BE";
      const expected = mockBoundaries.filter((b) => b.searchRank >= 90);

      mockBoundariesService.getPopular.mockResolvedValue(expected);

      const result = await controller.getPopular(country_code);

      expect(result).toEqual(expected);
      expect(service.getPopular).toHaveBeenCalledWith(country_code);
    });
  });

  describe("GET /:id", () => {
    it("should return boundary by ID", async () => {
      const id = "boundary-1";
      const expected = mockBoundaries[0];

      mockBoundariesService.findById.mockResolvedValue(expected);

      const result = await controller.findById(id);

      expect(result).toEqual(expected);
      expect(service.findById).toHaveBeenCalledWith(id);
    });

    it("should return null for non-existent ID", async () => {
      const id = "non-existent";

      mockBoundariesService.findById.mockResolvedValue(null);

      const result = await controller.findById(id);

      expect(result).toBeNull();
    });
  });
});
