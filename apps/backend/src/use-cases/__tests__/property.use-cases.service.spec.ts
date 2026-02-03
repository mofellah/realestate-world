import { Test, TestingModule } from "@nestjs/testing";
import { PropertyUseCasesService } from "../property.use-cases.service";
import { PropertiesService } from "../../properties/properties.service";

describe("PropertyUseCasesService", () => {
  let service: PropertyUseCasesService;
  let propertiesService: PropertiesService;

  const mockPropertiesService = {
    search: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyUseCasesService,
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    }).compile();

    service = module.get<PropertyUseCasesService>(PropertyUseCasesService);
    propertiesService = module.get<PropertiesService>(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should call propertiesService.search with filters", async () => {
      const filters = {
        minPrice: 100000,
        maxPrice: 500000,
        propertyType: "house",
        skip: 0,
        take: 20,
      };

      const mockResult = {
        properties: [],
        total: 0,
      };

      mockPropertiesService.search.mockResolvedValue(mockResult);

      const result = await service.search(filters);

      expect(result).toEqual(mockResult);
      expect(propertiesService.search).toHaveBeenCalledWith(filters);
    });

    it("should handle search with all filter options", async () => {
      const filters = {
        minPrice: 100000,
        maxPrice: 500000,
        propertyType: "apartment",
        minBedrooms: 2,
        maxBedrooms: 4,
        minBathrooms: 1,
        maxBathrooms: 2,
        latitude: 50.8503,
        longitude: 4.3517,
        radius: 5000,
        amenities: ["school", "park"],
        boundaries: ["boundary-1"],
        skip: 10,
        take: 20,
      };

      mockPropertiesService.search.mockResolvedValue({ properties: [], total: 0 });

      await service.search(filters);

      expect(propertiesService.search).toHaveBeenCalledWith(filters);
    });

    it("should handle search with minimal filters", async () => {
      const filters = {
        skip: 0,
        take: 20,
      };

      mockPropertiesService.search.mockResolvedValue({ properties: [], total: 0 });

      await service.search(filters);

      expect(propertiesService.search).toHaveBeenCalledWith(filters);
    });
  });

  describe("create", () => {
    it("should call propertiesService.create with userId and data", async () => {
      const userId = "user-123";
      const propertyData = {
        title: "Test Property",
        description: "A test property",
        price: 250000,
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2,
        surfaceArea: 150,
        address: {
          street: "Test Street",
          number: "10",
          city: "Brussels",
          postalCode: "1000",
          country: "Belgium",
        },
      };

      const mockCreatedProperty = {
        id: "prop-1",
        ...propertyData,
      };

      mockPropertiesService.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.create(userId, propertyData as any);

      expect(result).toEqual(mockCreatedProperty);
      expect(propertiesService.create).toHaveBeenCalledWith(userId, propertyData);
    });
  });
});
