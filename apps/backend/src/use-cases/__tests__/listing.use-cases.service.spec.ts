import { Test, TestingModule } from "@nestjs/testing";
import { ListingUseCasesService } from "../listing.use-cases.service";
import { ListingsService } from "../../listings/listings.service";

describe("ListingUseCasesService", () => {
  let service: ListingUseCasesService;
  let listingsService: ListingsService;

  const mockListingsService = {
    create: jest.fn(),
    publish: jest.fn(),
    pause: jest.fn(),
    renew: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingUseCasesService,
        {
          provide: ListingsService,
          useValue: mockListingsService,
        },
      ],
    }).compile();

    service = module.get<ListingUseCasesService>(ListingUseCasesService);
    listingsService = module.get<ListingsService>(ListingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call listingsService.create with userId and data", async () => {
      const userId = "user-123";
      const listingData = {
        propertyId: "prop-1",
        title: "Test Listing",
        description: "A test listing",
        price: 250000,
      };

      const mockCreatedListing = {
        id: "listing-1",
        ...listingData,
      };

      mockListingsService.create.mockResolvedValue(mockCreatedListing);

      const result = await service.create(userId, listingData as any);

      expect(result).toEqual(mockCreatedListing);
      expect(listingsService.create).toHaveBeenCalledWith(userId, listingData);
    });
  });

  describe("publish", () => {
    it("should call listingsService.publish", async () => {
      const userId = "user-123";
      const listingId = "listing-1";
      const publishData = {
        publishedAt: new Date(),
      };

      const mockPublishedListing = {
        id: listingId,
        status: "active",
      };

      mockListingsService.publish.mockResolvedValue(mockPublishedListing);

      const result = await service.publish(userId, listingId, publishData as any);

      expect(result).toEqual(mockPublishedListing);
      expect(listingsService.publish).toHaveBeenCalledWith(listingId, userId, publishData);
    });
  });

  describe("pause", () => {
    it("should call listingsService.pause", async () => {
      const userId = "user-123";
      const listingId = "listing-1";

      const mockPausedListing = {
        id: listingId,
        status: "paused",
      };

      mockListingsService.pause.mockResolvedValue(mockPausedListing);

      const result = await service.pause(userId, listingId);

      expect(result).toEqual(mockPausedListing);
      expect(listingsService.pause).toHaveBeenCalledWith(listingId, userId);
    });
  });

  describe("renew", () => {
    it("should call listingsService.renew", async () => {
      const userId = "user-123";
      const listingId = "listing-1";
      const renewData = {
        expiresAt: new Date(),
      };

      const mockRenewedListing = {
        id: listingId,
        status: "active",
      };

      mockListingsService.renew.mockResolvedValue(mockRenewedListing);

      const result = await service.renew(userId, listingId, renewData as any);

      expect(result).toEqual(mockRenewedListing);
      expect(listingsService.renew).toHaveBeenCalledWith(listingId, userId, renewData);
    });
  });
});
