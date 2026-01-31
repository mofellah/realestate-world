/**
 * ListingsService Unit Tests
 * Tests for listing API client methods
 */

import { listingsService } from "../../services/listings-service";
import { apiClient } from "../../services/api-client";

// Mock the API client
jest.mock("../../services/api-client");

describe("ListingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockListing = {
    id: "listing-1",
    propertyId: "prop-1",
    type: "sale",
    status: "published",
    price: 500000,
    currency: "USD",
    title: "Beautiful House",
    description: "A beautiful house for sale",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe("createListing", () => {
    it("should make POST request with listing data", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockListing);

      const listingData = {
        propertyId: "prop-1",
        type: "sale",
        status: "draft",
      };

      const result = await listingsService.createListing(listingData);

      expect(apiClient.post).toHaveBeenCalledWith("/listings", listingData);
      expect(result).toEqual(mockListing);
    });

    it("should return created listing with ID", async () => {
      const createdListing = {
        ...mockListing,
        id: "new-listing-id",
      };
      (apiClient.post as jest.Mock).mockResolvedValue(createdListing);

      const result = await listingsService.createListing({
        propertyId: "prop-1",
        type: "rent",
      });

      expect(result.id).toBeDefined();
      expect(result.id).toBe("new-listing-id");
    });

    it("should throw error when listing creation fails", async () => {
      const error = new Error("Validation Error");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      const listingData = {
        propertyId: "prop-1",
        type: "invalid-type",
      };

      await expect(listingsService.createListing(listingData)).rejects.toThrow("Validation Error");
    });

    it("should throw error when property does not exist", async () => {
      const error = new Error("Property not found");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        listingsService.createListing({
          propertyId: "nonexistent",
          type: "sale",
        }),
      ).rejects.toThrow("Property not found");
    });

    it("should handle missing required fields", async () => {
      const error = new Error("Missing required fields");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.createListing({})).rejects.toThrow("Missing required fields");
    });
  });

  describe("getMyListings", () => {
    it("should make GET request for user listings", async () => {
      const mockListings = [mockListing, { ...mockListing, id: "listing-2" }];
      (apiClient.get as jest.Mock).mockResolvedValue(mockListings);

      const result = await listingsService.getMyListings();

      expect(apiClient.get).toHaveBeenCalledWith("/listings");
      expect(result).toEqual(mockListings);
    });

    it("should return array of listings", async () => {
      const mockListings = [mockListing, { ...mockListing, id: "listing-2" }];
      (apiClient.get as jest.Mock).mockResolvedValue(mockListings);

      const result = await listingsService.getMyListings();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it("should return empty array when user has no listings", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await listingsService.getMyListings();

      expect(result).toEqual([]);
    });

    it("should throw error when API fails", async () => {
      const error = new Error("Server Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getMyListings()).rejects.toThrow("Server Error");
    });

    it("should throw error on unauthorized access", async () => {
      const error = new Error("Unauthorized");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getMyListings()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getListing", () => {
    it("should make GET request for specific listing", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockListing);

      const result = await listingsService.getListing("listing-1");

      expect(apiClient.get).toHaveBeenCalledWith("/listings/listing-1");
      expect(result).toEqual(mockListing);
    });

    it("should return listing details", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockListing);

      const result = await listingsService.getListing("listing-1");

      expect(result.id).toBe("listing-1");
      expect(result.propertyId).toBe("prop-1");
      expect(result.type).toBe("sale");
    });

    it("should throw error when listing not found", async () => {
      const error = new Error("Listing not found");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getListing("nonexistent")).rejects.toThrow("Listing not found");
    });
  });

  describe("updateListing", () => {
    it("should make PATCH request with listing ID and data", async () => {
      const updatedListing = {
        ...mockListing,
        status: "archived",
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(updatedListing);

      const updateData = { status: "archived" };
      const result = await listingsService.updateListing("listing-1", updateData);

      expect(apiClient.patch).toHaveBeenCalledWith("/listings/listing-1", updateData);
      expect(result).toEqual(updatedListing);
    });

    it("should return updated listing", async () => {
      const updatedListing = {
        ...mockListing,
        price: 450000,
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(updatedListing);

      const result = await listingsService.updateListing("listing-1", {
        price: 450000,
      });

      expect(result.price).toBe(450000);
    });

    it("should throw error when listing not found", async () => {
      const error = new Error("Listing not found");
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(
        listingsService.updateListing("nonexistent", { status: "published" }),
      ).rejects.toThrow("Listing not found");
    });

    it("should throw error on unauthorized update", async () => {
      const error = new Error("Unauthorized");
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(
        listingsService.updateListing("listing-1", { status: "archived" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw error when update validation fails", async () => {
      const error = new Error("Invalid status");
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(
        listingsService.updateListing("listing-1", { status: "invalid" }),
      ).rejects.toThrow("Invalid status");
    });
  });

  describe("deleteListing", () => {
    it("should make DELETE request for listing ID", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await listingsService.deleteListing("listing-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/listings/listing-1");
    });

    it("should return void on successful deletion", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await listingsService.deleteListing("listing-1");

      expect(result).toBeUndefined();
    });

    it("should throw error when listing not found", async () => {
      const error = new Error("Listing not found");
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.deleteListing("nonexistent")).rejects.toThrow(
        "Listing not found",
      );
    });

    it("should throw error on unauthorized deletion", async () => {
      const error = new Error("Unauthorized");
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.deleteListing("listing-1")).rejects.toThrow("Unauthorized");
    });
  });

  describe("error handling", () => {
    it("should propagate API errors", async () => {
      const error = new Error("Network Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getMyListings()).rejects.toThrow("Network Error");
    });

    it("should handle timeout errors", async () => {
      const error = new Error("Request timeout");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getMyListings()).rejects.toThrow("Request timeout");
    });

    it("should handle authorization errors", async () => {
      const error = new Error("Unauthorized");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        listingsService.createListing({ propertyId: "prop-1", type: "sale" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle server errors", async () => {
      const error = new Error("Internal Server Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(listingsService.getListing("listing-1")).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  describe("listing status transitions", () => {
    it("should support transitioning from draft to published", async () => {
      const publishedListing = {
        ...mockListing,
        status: "published",
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(publishedListing);

      const result = await listingsService.updateListing("listing-1", {
        status: "published",
      });

      expect(result.status).toBe("published");
    });

    it("should support transitioning to archived", async () => {
      const archivedListing = {
        ...mockListing,
        status: "archived",
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(archivedListing);

      const result = await listingsService.updateListing("listing-1", {
        status: "archived",
      });

      expect(result.status).toBe("archived");
    });
  });

  describe("batch operations", () => {
    it("should handle multiple listings in getMyListings", async () => {
      const listings = [
        mockListing,
        { ...mockListing, id: "listing-2", type: "rent" },
        { ...mockListing, id: "listing-3", type: "airbnb" },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue(listings);

      const result = await listingsService.getMyListings();

      expect(result.length).toBe(3);
      expect(result[0].type).toBe("sale");
      expect(result[1].type).toBe("rent");
      expect(result[2].type).toBe("airbnb");
    });
  });
});
