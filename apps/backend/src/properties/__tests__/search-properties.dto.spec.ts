/**
 * Search Properties DTO Tests
 * Testing validation and transformation logic
 */

import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SearchPropertiesDto } from "../dto/search-properties.dto";

describe("SearchPropertiesDto", () => {
  describe("Price Filters", () => {
    it("should accept valid minPrice", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minPrice: "100000" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minPrice).toBe(100000);
    });

    it("should accept valid maxPrice", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxPrice: "500000" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.maxPrice).toBe(500000);
    });

    it("should reject negative minPrice", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minPrice: "-100" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("minPrice");
    });

    it("should reject negative maxPrice", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxPrice: "-500" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("maxPrice");
    });

    it("should work without price filters", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minPrice).toBeUndefined();
      expect(dto.maxPrice).toBeUndefined();
    });
  });

  describe("Property Type Filter", () => {
    const validTypes = [
      "studio",
      "house",
      "apartment",
      "villa",
      "land",
      "room",
      "commercial",
      "other",
    ];

    validTypes.forEach((type) => {
      it(`should accept valid propertyType: ${type}`, async () => {
        const dto = plainToInstance(SearchPropertiesDto, { propertyType: type });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
        expect(dto.propertyType).toBe(type);
      });
    });

    it("should reject invalid propertyType", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { propertyType: "invalid" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("propertyType");
    });

    it("should transform 'type' to 'propertyType' when propertyType is not provided", async () => {
      const rawDto: any = { type: "house" };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      // The transformation sets propertyType on the raw object during transform
      expect(rawDto.propertyType).toBe("house");
      expect(errors.length).toBe(0);
    });

    it("should prefer propertyType over type when both provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        type: "house",
        propertyType: "apartment",
      });
      const errors = await validate(dto);
      expect(dto.propertyType).toBe("apartment");
    });

    it("should not transform when type is not provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {});
      const errors = await validate(dto);
      expect(dto.propertyType).toBeUndefined();
      expect(dto.type).toBeUndefined();
    });
  });

  describe("Bedrooms Filters", () => {
    it("should accept valid minBedrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minBedrooms: "2" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minBedrooms).toBe(2);
    });

    it("should accept valid maxBedrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxBedrooms: "5" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.maxBedrooms).toBe(5);
    });

    it("should reject negative minBedrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minBedrooms: "-1" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject negative maxBedrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxBedrooms: "-1" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should transform 'bedrooms' to 'minBedrooms' when minBedrooms is not provided", async () => {
      const rawDto: any = { bedrooms: "3" };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      expect(rawDto.minBedrooms).toBe(3);
      expect(errors.length).toBe(0);
    });

    it("should prefer minBedrooms over bedrooms when both provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { bedrooms: "3", minBedrooms: "2" });
      const errors = await validate(dto);
      expect(dto.minBedrooms).toBe(2);
    });

    it("should handle bedrooms = 0", async () => {
      const rawDto: any = { bedrooms: "0" };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(rawDto.minBedrooms).toBe(0);
    });

    it("should not transform when bedrooms is not provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {});
      const errors = await validate(dto);
      expect(dto.minBedrooms).toBeUndefined();
      expect(dto.bedrooms).toBeUndefined();
    });
  });

  describe("Bathrooms Filters", () => {
    it("should accept valid minBathrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minBathrooms: "1" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minBathrooms).toBe(1);
    });

    it("should accept valid maxBathrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxBathrooms: "3" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.maxBathrooms).toBe(3);
    });

    it("should reject negative minBathrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { minBathrooms: "-1" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject negative maxBathrooms", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { maxBathrooms: "-1" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should transform 'bathrooms' to 'minBathrooms' when minBathrooms is not provided", async () => {
      const rawDto: any = { bathrooms: "2" };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      expect(rawDto.minBathrooms).toBe(2);
      expect(errors.length).toBe(0);
    });

    it("should prefer minBathrooms over bathrooms when both provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { bathrooms: "3", minBathrooms: "1" });
      const errors = await validate(dto);
      expect(dto.minBathrooms).toBe(1);
    });

    it("should handle bathrooms = 0", async () => {
      const rawDto: any = { bathrooms: "0" };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(rawDto.minBathrooms).toBe(0);
    });

    it("should not transform when bathrooms is not provided", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {});
      const errors = await validate(dto);
      expect(dto.minBathrooms).toBeUndefined();
      expect(dto.bathrooms).toBeUndefined();
    });
  });

  describe("Spatial Filters", () => {
    it("should accept valid latitude", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { latitude: "40.7128" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.latitude).toBe(40.7128);
    });

    it("should accept valid longitude", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { longitude: "-74.0060" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.longitude).toBe(-74.006);
    });

    it("should accept valid radius", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { radius: "5000" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.radius).toBe(5000);
    });

    it("should reject latitude > 90", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { latitude: "91" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("latitude");
    });

    it("should reject latitude < -90", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { latitude: "-91" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("latitude");
    });

    it("should reject longitude > 180", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { longitude: "181" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("longitude");
    });

    it("should reject longitude < -180", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { longitude: "-181" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("longitude");
    });

    it("should reject negative radius", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { radius: "-100" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("radius");
    });

    it("should accept all spatial parameters together", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        latitude: "40.7128",
        longitude: "-74.0060",
        radius: "5000",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.latitude).toBe(40.7128);
      expect(dto.longitude).toBe(-74.006);
      expect(dto.radius).toBe(5000);
    });
  });

  describe("Distance Metric", () => {
    const validMetrics = ["walking", "driving", "direct"];

    validMetrics.forEach((metric) => {
      it(`should accept valid distanceMetric: ${metric}`, async () => {
        const dto = plainToInstance(SearchPropertiesDto, { distanceMetric: metric });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
        expect(dto.distanceMetric).toBe(metric);
      });
    });

    it("should reject invalid distanceMetric", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { distanceMetric: "invalid" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("distanceMetric");
    });
  });

  describe("Amenities Filter", () => {
    it("should transform comma-separated string to array", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { amenities: "schools,parks,restaurants" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.amenities).toEqual(["schools", "parks", "restaurants"]);
    });

    it("should trim whitespace from amenities", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        amenities: " schools , parks , restaurants ",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.amenities).toEqual(["schools", "parks", "restaurants"]);
    });

    it("should filter out empty strings", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        amenities: "schools,,parks,,,restaurants",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.amenities).toEqual(["schools", "parks", "restaurants"]);
    });

    it("should accept array of amenities", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { amenities: ["schools", "parks"] });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.amenities).toEqual(["schools", "parks"]);
    });

    it("should return undefined for empty string", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { amenities: "" });
      const errors = await validate(dto);
      expect(dto.amenities).toBeUndefined();
    });

    it("should return undefined for null", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { amenities: null });
      const errors = await validate(dto);
      expect(dto.amenities).toBeUndefined();
    });

    it("should handle single amenity", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { amenities: "schools" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.amenities).toEqual(["schools"]);
    });
  });

  describe("Pagination", () => {
    it("should accept valid skip", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { skip: "10" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.skip).toBe(10);
    });

    it("should accept valid take", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { take: "50" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.take).toBe(50);
    });

    it("should reject negative skip", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { skip: "-1" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("skip");
    });

    it("should reject take < 1", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { take: "0" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("take");
    });

    it("should reject take > 100", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { take: "101" });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("take");
    });

    it("should accept skip = 0", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { skip: "0" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.skip).toBe(0);
    });

    it("should accept take = 100 (max)", async () => {
      const dto = plainToInstance(SearchPropertiesDto, { take: "100" });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.take).toBe(100);
    });
  });

  describe("Complex Scenarios", () => {
    it("should accept all parameters together", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        minPrice: "100000",
        maxPrice: "500000",
        propertyType: "house",
        minBedrooms: "2",
        maxBedrooms: "5",
        minBathrooms: "1",
        maxBathrooms: "3",
        latitude: "40.7128",
        longitude: "-74.0060",
        radius: "5000",
        distanceMetric: "walking",
        amenities: "schools,parks",
        skip: "0",
        take: "20",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minPrice).toBe(100000);
      expect(dto.maxPrice).toBe(500000);
      expect(dto.propertyType).toBe("house");
      expect(dto.minBedrooms).toBe(2);
      expect(dto.maxBedrooms).toBe(5);
      expect(dto.minBathrooms).toBe(1);
      expect(dto.maxBathrooms).toBe(3);
      expect(dto.latitude).toBe(40.7128);
      expect(dto.longitude).toBe(-74.006);
      expect(dto.radius).toBe(5000);
      expect(dto.distanceMetric).toBe("walking");
      expect(dto.amenities).toEqual(["schools", "parks"]);
      expect(dto.skip).toBe(0);
      expect(dto.take).toBe(20);
    });

    it("should work with minimal parameters (only pagination)", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {
        skip: "0",
        take: "20",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should work with backward-compatible aliases", async () => {
      const rawDto: any = {
        type: "apartment",
        bedrooms: "2",
        bathrooms: "1",
      };
      const dto = plainToInstance(SearchPropertiesDto, rawDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(rawDto.propertyType).toBe("apartment");
      expect(rawDto.minBedrooms).toBe(2);
      expect(rawDto.minBathrooms).toBe(1);
    });

    it("should handle empty object (no filters)", async () => {
      const dto = plainToInstance(SearchPropertiesDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.minPrice).toBeUndefined();
      expect(dto.maxPrice).toBeUndefined();
      expect(dto.propertyType).toBeUndefined();
      expect(dto.minBedrooms).toBeUndefined();
      expect(dto.maxBedrooms).toBeUndefined();
      expect(dto.minBathrooms).toBeUndefined();
      expect(dto.maxBathrooms).toBeUndefined();
      expect(dto.latitude).toBeUndefined();
      expect(dto.longitude).toBeUndefined();
      expect(dto.radius).toBeUndefined();
      expect(dto.distanceMetric).toBeUndefined();
      expect(dto.amenities).toBeUndefined();
      expect(dto.skip).toBeUndefined();
      expect(dto.take).toBeUndefined();
    });
  });
});
