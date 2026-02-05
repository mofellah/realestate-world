/**
 * Property Validation Schemas (Zod)
 * Runtime validation for property data
 */

import { z } from "zod";

export const PropertyTypeEnum = z.enum([
  "studio",
  "house",
  "apartment",
  "villa",
  "land",
  "room",
  "commercial",
  "other",
]);

export const ListingTypeEnum = z.enum(["sale", "rental", "short_term", "lease"]);

/**
 * Create Property Schema
 * All validations with helpful error messages
 */
export const CreatePropertySchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters"),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),

    addressId: z.string().min(1, "Address ID is required").cuid("Address ID must be a valid CUID"),

    propertyType: PropertyTypeEnum.default("house").optional(),

    bedrooms: z
      .number()
      .int("Bedrooms must be a whole number")
      .min(0, "Bedrooms cannot be negative")
      .optional()
      .nullable(),

    bathrooms: z.number().min(0, "Bathrooms cannot be negative").optional().nullable(),

    surfaceArea: z.number().positive("Surface area must be positive").optional().nullable(),

    gardenSize: z.number().min(0, "Garden size cannot be negative").optional().nullable(),

    yearBuilt: z
      .number()
      .int("Year must be a whole number")
      .min(1800, "Year must be 1800 or later")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .optional()
      .nullable(),

    amenitiesList: z.array(z.string().min(1, "Amenity cannot be empty")).optional().nullable(),

    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict(); // Reject unknown properties

/**
 * Update Property Schema
 * All fields optional, same validations as create
 */
export const UpdatePropertySchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters")
      .optional(),

    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),

    propertyType: PropertyTypeEnum.optional(),

    bedrooms: z
      .number()
      .int("Bedrooms must be a whole number")
      .min(0, "Bedrooms cannot be negative")
      .optional()
      .nullable(),

    bathrooms: z.number().min(0, "Bathrooms cannot be negative").optional().nullable(),

    surfaceArea: z.number().positive("Surface area must be positive").optional().nullable(),

    gardenSize: z.number().min(0, "Garden size cannot be negative").optional().nullable(),

    yearBuilt: z
      .number()
      .int("Year must be a whole number")
      .min(1800, "Year must be 1800 or later")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .optional()
      .nullable(),

    amenitiesList: z.array(z.string().min(1, "Amenity cannot be empty")).optional().nullable(),

    metadata: z.record(z.unknown()).optional().nullable(),

    isAvailable: z.boolean().optional(),
  })
  .strict();

/**
 * Search Properties Schema
 */
export const SearchPropertiesSchema = z
  .object({
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional(),

    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional(),

    radius: z.number().positive("Radius must be positive").optional(),

    propertyType: PropertyTypeEnum.optional(),

    listingType: ListingTypeEnum.optional(),

    minBedrooms: z.number().int().min(0).optional(),

    maxBedrooms: z.number().int().min(0).optional(),

    minBathrooms: z.number().int().min(0).optional(),

    maxBathrooms: z.number().int().min(0).optional(),

    minPrice: z.number().min(0).optional(),

    maxPrice: z.number().min(0).optional(),

    amenities: z.array(z.string()).optional(),

    boundaries: z.array(z.string()).optional(),

    distanceMetric: z.enum(["walking", "driving", "direct"]).optional(),

    skip: z.number().int().min(0).optional().default(0),

    take: z.number().int().min(1).max(100).optional().default(10),
  })
  .strip(); // Allow extra properties but remove them

// Export types for use in services/controllers
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type SearchPropertiesInput = z.infer<typeof SearchPropertiesSchema>;
