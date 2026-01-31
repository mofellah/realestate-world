/**
 * Property Test Fixtures
 *
 * Provides factory functions to create mock property and address data for tests.
 * Used for testing property-related services and controllers.
 */

// Property type matching Prisma Property model
type Property = {
  id: string;
  title: string;
  description: string | null;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surfaceArea: number | null;
  gardenSize: number | null;
  yearBuilt: number | null;
  amenitiesList: string[];
  addressId: string;
  ownerPersonId: string;
  userId: string | null;
  ownerDocumentUrl: string | null;
  parentPropertyId: string | null;
  isAvailable: boolean;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

// Address type matching Prisma Address model
type Address = {
  id: string;
  streetName: string;
  streetNumber: string | null;
  unit: string | null;
  postalCode: string;
  city: string;
  region: string | null;
  country_code: string;
  geoObjectId: string | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Create a mock address entity
 * @param overrides - Optional field overrides
 * @returns Address entity with default values
 */
export function createMockAddress(overrides?: Partial<Address>): Address {
  const now = new Date();
  return {
    id: "addr-" + Math.random().toString(36).substring(7),
    streetName: "Test Street",
    streetNumber: "123",
    unit: null,
    postalCode: "1000",
    city: "Brussels",
    region: "Brussel",
    country_code: "BE",
    geoObjectId: null,
    metadata: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock property entity
 * @param userId - ID of the property owner (user)
 * @param ownerPersonId - ID of the person owning the property
 * @param addressId - ID of the property address
 * @param overrides - Optional field overrides
 * @returns Property entity with default values
 */
export function createMockProperty(
  userId: string,
  ownerPersonId: string,
  addressId: string,
  overrides?: Partial<Property>,
): Property {
  const now = new Date();
  return {
    id: "prop-" + Math.random().toString(36).substring(7),
    title: "Test Property",
    description: "A test property for unit tests",
    addressId: addressId,
    ownerPersonId: ownerPersonId,
    userId: userId,
    ownerDocumentUrl: null,
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 150,
    gardenSize: 50,
    yearBuilt: 2015,
    amenitiesList: ["garage", "garden"],
    metadata: null,
    parentPropertyId: null,
    isAvailable: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple mock properties
 * @param userId - ID of the owner (user)
 * @param ownerPersonId - ID of the person owning the property
 * @param addressId - ID of the property address
 * @param count - Number of properties to create
 * @param overrides - Optional field overrides
 * @returns Array of property entities
 */
export function createMockProperties(
  userId: string,
  ownerPersonId: string,
  addressId: string,
  count: number,
  overrides?: Partial<Property>,
): Property[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProperty(userId, ownerPersonId, addressId, {
      id: `prop-${i + 1}`,
      title: `Property ${i + 1}`,
      ...overrides,
    }),
  );
}

/**
 * Create a mock apartment property
 * @param userId - Owner user ID
 * @param ownerPersonId - Owner person ID
 * @param addressId - Address ID
 * @param overrides - Optional overrides
 * @returns Property of type apartment
 */
export function createMockApartment(
  userId: string,
  ownerPersonId: string,
  addressId: string,
  overrides?: Partial<Property>,
): Property {
  return createMockProperty(userId, ownerPersonId, addressId, {
    propertyType: "apartment",
    gardenSize: 0,
    ...overrides,
  });
}

/**
 * Create a mock house property
 * @param userId - Owner user ID
 * @param ownerPersonId - Owner person ID
 * @param addressId - Address ID
 * @param overrides - Optional overrides
 * @returns Property of type house
 */
export function createMockHouse(
  userId: string,
  ownerPersonId: string,
  addressId: string,
  overrides?: Partial<Property>,
): Property {
  return createMockProperty(userId, ownerPersonId, addressId, {
    propertyType: "house",
    gardenSize: 100,
    ...overrides,
  });
}
