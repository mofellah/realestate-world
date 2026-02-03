import { Test, TestingModule } from "@nestjs/testing";
import { AmenitiesController } from "../amenities.controller";
import { AmenitiesService } from "../amenities.service";
import { SearchAmenitiesDto } from "../dto/search-amenities.dto";
import { AutocompleteAmenitiesDto } from "../dto/autocomplete-amenities.dto";

describe("AmenitiesController", () => {
  let controller: AmenitiesController;
  let service: AmenitiesService;

  const mockAmenitiesService = {
    search: jest.fn(),
    autocomplete: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmenitiesController],
      providers: [
        {
          provide: AmenitiesService,
          useValue: mockAmenitiesService,
        },
      ],
    }).compile();

    controller = module.get<AmenitiesController>(AmenitiesController);
    service = module.get<AmenitiesService>(AmenitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should return search results", async () => {
      const dto: SearchAmenitiesDto = {
        limit: 10,
      };

      const mockResult = [
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

      mockAmenitiesService.search.mockResolvedValue(mockResult);

      const result = await controller.search(dto);

      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it("should handle filtered search", async () => {
      const dto: SearchAmenitiesDto = {
        limit: 10,
        type: "school" as any,
        name: "public",
      };

      const mockResult: any[] = [];

      mockAmenitiesService.search.mockResolvedValue(mockResult);

      const result = await controller.search(dto);

      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith(dto);
    });
  });

  describe("autocomplete", () => {
    it("should return autocomplete suggestions", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "school",
        limit: 5,
      };

      const mockResult = [{ name: "Public School" }, { name: "Private School" }];

      mockAmenitiesService.autocomplete.mockResolvedValue(mockResult);

      const result = await controller.autocomplete(dto);

      expect(result).toEqual(mockResult);
      expect(service.autocomplete).toHaveBeenCalledWith(dto);
    });

    it("should handle autocomplete with type filter", async () => {
      const dto: AutocompleteAmenitiesDto = {
        query: "test",
        type: "restaurant",
        limit: 10,
      };

      const mockResult = [{ name: "Test Restaurant" }];

      mockAmenitiesService.autocomplete.mockResolvedValue(mockResult);

      const result = await controller.autocomplete(dto);

      expect(result).toEqual(mockResult);
      expect(service.autocomplete).toHaveBeenCalledWith(dto);
    });
  });

  describe("findById", () => {
    it("should return amenity by id", async () => {
      const mockAmenity = {
        id: "1",
        name: "Test School",
        type: "school" as any,
      };

      mockAmenitiesService.findById.mockResolvedValue(mockAmenity);

      const result = await controller.findById("1");

      expect(result).toEqual(mockAmenity);
      expect(service.findById).toHaveBeenCalledWith("1");
    });
  });
});
