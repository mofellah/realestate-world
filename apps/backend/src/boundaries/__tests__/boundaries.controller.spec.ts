import { Test, TestingModule } from "@nestjs/testing";
import { BoundariesController } from "../boundaries.controller";
import { BoundariesService } from "../boundaries.service";
import { SearchBoundariesDto } from "../dto/search-boundaries.dto";
import { AutocompleteBoundariesDto } from "../dto/autocomplete-boundaries.dto";

describe("BoundariesController", () => {
  let controller: BoundariesController;
  let service: BoundariesService;

  const mockBoundariesService = {
    search: jest.fn(),
    autocomplete: jest.fn(),
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

  describe("search", () => {
    it("should return search results", async () => {
      const dto: SearchBoundariesDto = {
        limit: 10,
      };

      const mockResult = [
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

      mockBoundariesService.search.mockResolvedValue(mockResult);

      const result = await controller.search(dto);

      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith(dto);
    });
  });

  describe("autocomplete", () => {
    it("should return autocomplete suggestions", async () => {
      const dto: AutocompleteBoundariesDto = {
        query: "Brus",
      };

      const mockResult = [
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

      mockBoundariesService.autocomplete.mockResolvedValue(mockResult);

      const result = await controller.autocomplete(dto);

      expect(result).toEqual(mockResult);
      expect(service.autocomplete).toHaveBeenCalledWith(dto);
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

      mockBoundariesService.findById.mockResolvedValue(mockBoundary);

      const result = await controller.findById("1");

      expect(result).toEqual(mockBoundary);
      expect(service.findById).toHaveBeenCalledWith("1");
    });
  });
});
