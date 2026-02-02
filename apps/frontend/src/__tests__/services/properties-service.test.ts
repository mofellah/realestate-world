/**
 * PropertiesService Unit Tests
 * Tests for property API client methods
 */

import { propertiesService } from "../../services/properties-service";
import { apiClient } from "../../services/api-client";

// Mock the API client
jest.mock("../../services/api-client");

describe("PropertiesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProperty = {
    id: "prop-1",
    type: "house",
    address: {
      id: "addr-1",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      latitude: 40.7128,
      longitude: -74.006,
    },
    listings: [],
  };

  // Mock API response (before transformation)
  const mockPropertyDetailApiResponse = {
    id: "prop-1",
    type: "house",
    propertyType: "house",
    title: "Beautiful House",
    description: "A nice house",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 1500,
    images: ["image1.jpg", "image2.jpg"],
    address: {
      id: "addr-1",
      streetName: "123 Main St",
      city: "New York",
      region: "NY",
      postalCode: "10001",
      country_code: "USA",
      geoObject: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    },
    listings: [
      {
        id: "list-1",
        type: "sale",
        status: "published",
        paymentTerms: {
          id: "term-1",
          type: "fixed",
          termType: "fixed",
          currency: "USD",
          onetimePayment: {
            amount: 500000,
          },
        },
        views: [
          {
            id: "view-1",
            userId: "user-1",
            viewedAt: new Date().toISOString(),
          },
        ],
      },
    ],
    ownerPerson: {
      id: "owner-1",
      email: "owner@example.com",
      phone: "555-1234",
    },
  };

  // Expected transformed response
  const mockPropertyDetail = {
    id: "prop-1",
    type: "house",
    propertyType: "house",
    title: "Beautiful House",
    description: "A nice house",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 1500,
    images: ["image1.jpg", "image2.jpg"],
    address: {
      id: "addr-1",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      latitude: 40.7128,
      longitude: -74.006,
    },
    listings: [
      {
        id: "list-1",
        type: "sale",
        status: "published",
        paymentTerms: [
          {
            id: "term-1",
            type: "fixed",
            termType: "fixed",
            currency: "USD",
            amount: 500000,
            amountPerPeriod: undefined,
          },
        ],
      },
    ],
    views: [
      {
        id: "view-1",
        userId: "user-1",
        viewedAt: expect.any(String),
      },
    ],
    ownerPerson: {
      id: "owner-1",
      email: "owner@example.com",
      phone: "555-1234",
    },
    user: undefined,
  };

  describe("searchProperties", () => {
    it("should make GET request with search parameters", async () => {
      const mockResults = [mockProperty];
      (apiClient.get as jest.Mock).mockResolvedValue(mockResults);

      const params = {
        city: "New York",
        bedrooms: 3,
        priceMin: 400000,
        priceMax: 600000,
      };

      const result = await propertiesService.searchProperties(params);

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining("/properties/search"));
      expect(result).toEqual(mockResults);
    });

    it("should handle search without filters", async () => {
      const mockResults = [mockProperty];
      (apiClient.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await propertiesService.searchProperties({});

      expect(apiClient.get).toHaveBeenCalledWith("/properties/search");
      expect(result).toEqual(mockResults);
    });

    it("should build query string with multiple parameters", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await propertiesService.searchProperties({
        city: "New York",
        type: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        priceMin: 300000,
        priceMax: 500000,
        skip: 0,
        take: 10,
      });

      const callArgs = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callArgs).toMatch(/city=New[+%20]York/);
      expect(callArgs).toContain("type=apartment");
      expect(callArgs).toContain("bedrooms=2");
      expect(callArgs).toContain("priceMin=300000");
    });

    it("should handle location-based search with coordinates", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      await propertiesService.searchProperties({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      });

      const callArgs = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callArgs).toContain("latitude=40.7128");
      expect(callArgs).toMatch(/longitude=-74\.00[6]?0?/);
      expect(callArgs).toContain("radius=5");
    });

    it("should throw error when API call fails", async () => {
      const error = new Error("API Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.searchProperties({ city: "New York" })).rejects.toThrow(
        "API Error",
      );
    });
  });

  describe("getPropertyDetail", () => {
    it("should make GET request for property details", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPropertyDetailApiResponse);

      const result = await propertiesService.getPropertyDetail("prop-1");

      expect(apiClient.get).toHaveBeenCalledWith("/properties/prop-1");
      expect(result).toMatchObject({
        id: mockPropertyDetail.id,
        type: mockPropertyDetail.type,
        title: mockPropertyDetail.title,
        address: mockPropertyDetail.address,
        listings: expect.any(Array),
      });
    });

    it("should return property with listings and views", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPropertyDetailApiResponse);

      const result = await propertiesService.getPropertyDetail("prop-1");

      expect(result.listings).toBeDefined();
      expect(result.listings.length).toBeGreaterThan(0);
      expect(result.views).toBeDefined();
    });

    it("should handle property without listings", async () => {
      const propertyNoListings = {
        ...mockProperty,
        listings: [],
      };
      (apiClient.get as jest.Mock).mockResolvedValue(propertyNoListings);

      const result = await propertiesService.getPropertyDetail("prop-1");

      expect(result.listings).toEqual([]);
    });

    it("should throw error when property not found", async () => {
      const error = new Error("Not Found");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.getPropertyDetail("nonexistent")).rejects.toThrow("Not Found");
    });
  });

  describe("getAllProperties", () => {
    it("should make GET request with pagination", async () => {
      const mockResults = {
        properties: [mockProperty],
        total: 1,
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await propertiesService.getAllProperties(0, 20);

      expect(apiClient.get).toHaveBeenCalledWith("/properties?skip=0&take=20");
      expect(result).toEqual(mockResults);
    });

    it("should use default pagination values", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ properties: [] });

      await propertiesService.getAllProperties();

      expect(apiClient.get).toHaveBeenCalledWith("/properties?skip=0&take=20");
    });

    it("should accept custom pagination parameters", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ properties: [] });

      await propertiesService.getAllProperties(10, 50);

      expect(apiClient.get).toHaveBeenCalledWith("/properties?skip=10&take=50");
    });

    it("should return array of properties", async () => {
      const mockResults = {
        properties: [mockProperty, { ...mockProperty, id: "prop-2" }],
        total: 2,
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await propertiesService.getAllProperties(0, 20);

      expect(result.properties).toHaveLength(2);
    });

    it("should throw error when API fails", async () => {
      const error = new Error("Server Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.getAllProperties()).rejects.toThrow("Server Error");
    });
  });

  describe("createProperty", () => {
    it("should make POST request with property data", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockProperty);

      const propertyData = {
        type: "house",
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: "123 Main St",
          city: "New York",
        },
      };

      const result = await propertiesService.createProperty(propertyData);

      expect(apiClient.post).toHaveBeenCalledWith("/properties", propertyData);
      expect(result).toEqual(mockProperty);
    });

    it("should return created property with ID", async () => {
      const createdProperty = {
        ...mockProperty,
        id: "new-prop-id",
      };
      (apiClient.post as jest.Mock).mockResolvedValue(createdProperty);

      const result = await propertiesService.createProperty({
        type: "apartment",
      });

      expect(result.id).toBeDefined();
      expect(result.id).toBe("new-prop-id");
    });

    it("should throw error when property creation fails", async () => {
      const error = new Error("Validation Error");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      const propertyData = { type: "invalid" };

      await expect(propertiesService.createProperty(propertyData)).rejects.toThrow(
        "Validation Error",
      );
    });

    it("should handle missing required fields", async () => {
      const error = new Error("Missing required fields");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.createProperty({})).rejects.toThrow("Missing required fields");
    });
  });

  describe("updateProperty", () => {
    it("should make PATCH request with property ID and data", async () => {
      const updatedProperty = {
        ...mockProperty,
        type: "condo",
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(updatedProperty);

      const updateData = { type: "condo" };
      const result = await propertiesService.updateProperty("prop-1", updateData);

      expect(apiClient.patch).toHaveBeenCalledWith("/properties/prop-1", updateData);
      expect(result).toEqual(updatedProperty);
    });

    it("should return updated property", async () => {
      const updatedData = {
        ...mockProperty,
        address: {
          ...mockProperty.address,
          city: "Los Angeles",
        },
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(updatedData);

      const result = await propertiesService.updateProperty("prop-1", {
        city: "Los Angeles",
      });

      expect(result.address.city).toBe("Los Angeles");
    });

    it("should throw error when property not found", async () => {
      const error = new Error("Property not found");
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.updateProperty("nonexistent", {})).rejects.toThrow(
        "Property not found",
      );
    });

    it("should throw error when update validation fails", async () => {
      const error = new Error("Validation Error");
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.updateProperty("prop-1", { type: "invalid" })).rejects.toThrow(
        "Validation Error",
      );
    });
  });

  describe("deleteProperty", () => {
    it("should make DELETE request for property ID", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await propertiesService.deleteProperty("prop-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/properties/prop-1");
    });

    it("should return void on successful deletion", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await propertiesService.deleteProperty("prop-1");

      expect(result).toBeUndefined();
    });

    it("should throw error when property not found", async () => {
      const error = new Error("Property not found");
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.deleteProperty("nonexistent")).rejects.toThrow(
        "Property not found",
      );
    });

    it("should throw error on unauthorized deletion", async () => {
      const error = new Error("Unauthorized");
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.deleteProperty("prop-1")).rejects.toThrow("Unauthorized");
    });
  });

  describe("error handling", () => {
    it("should propagate API errors", async () => {
      const error = new Error("Network Error");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.searchProperties({})).rejects.toThrow("Network Error");
    });

    it("should handle timeout errors", async () => {
      const error = new Error("Request timeout");
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.getAllProperties()).rejects.toThrow("Request timeout");
    });

    it("should handle authorization errors", async () => {
      const error = new Error("Unauthorized");
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(propertiesService.createProperty({})).rejects.toThrow("Unauthorized");
    });
  });
});
