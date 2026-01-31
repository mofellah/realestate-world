/**
 * Address types and DTOs
 * Addresses are created separately and linked to Properties
 */
export interface CreateAddressDto {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  fullAddress?: string;
}

export interface AddressResponse extends CreateAddressDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Property types and DTOs
 */
export interface CreatePropertyDto {
  title: string;
  description?: string;
  addressId: string;
  propertyType: "residential" | "commercial" | "industrial" | "other";
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  gardenSize?: number;
  yearBuilt?: number;
  amenitiesList?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  propertyType?: "residential" | "commercial" | "industrial" | "other";
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  gardenSize?: number;
  yearBuilt?: number;
  amenitiesList?: string[];
  metadata?: Record<string, any>;
  isAvailable?: boolean;
}

export interface PropertyResponse extends CreatePropertyDto {
  id: string;
  userId: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  address: AddressResponse;
}

/**
 * Listing types and DTOs
 */
export type ListingStatus = "draft" | "published" | "sold" | "expired" | "archived";

export interface CreateListingDto {
  propertyId: string;
  price: number;
  currency: string;
  description?: string;
  status?: ListingStatus;
  features?: string[];
  photos?: string[];
  videoUrl?: string;
  expiresAt?: string;
}

export interface UpdateListingDto {
  price?: number;
  currency?: string;
  description?: string;
  status?: ListingStatus;
  features?: string[];
  photos?: string[];
  videoUrl?: string;
  expiresAt?: string;
}

export interface ListingResponse extends CreateListingDto {
  id: string;
  userId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  property: PropertyResponse;
}
