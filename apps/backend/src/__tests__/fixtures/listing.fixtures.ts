/**
 * Listing Test Fixtures
 *
 * Provides factory functions to create mock listing data for tests.
 * Includes base Listing and specialized subtypes (SaleListing, RentalListing).
 */

// Listing type matching Prisma Listing model
type Listing = {
  id: string;
  propertyId: string;
  type: string;
  status: string;
  paymentTermsId: string;
  visibilityStart: Date | null;
  visibilityEnd: Date | null;
  visibilityDays: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

/**
 * Create a mock base listing entity
 * @param propertyId - ID of the associated property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param overrides - Optional field overrides
 * @returns Listing entity with default values
 */
export function createMockListing(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  overrides?: Partial<Listing>,
): Listing {
  const now = new Date();
  return {
    id: "list-" + Math.random().toString(36).substring(7),
    propertyId: propertyId,
    createdBy: createdBy,
    paymentTermsId: paymentTermsId,
    type: "sale",
    status: "draft",
    publishedAt: null,
    visibilityStart: null,
    visibilityEnd: null,
    visibilityDays: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock sale listing
 * @param propertyId - ID of the associated property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param overrides - Optional field overrides
 * @returns Listing of type sale
 */
export function createMockSaleListing(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  overrides?: Partial<Listing>,
): Listing {
  return createMockListing(propertyId, createdBy, paymentTermsId, {
    type: "sale",
    ...overrides,
  });
}

/**
 * Create a mock rental listing
 * @param propertyId - ID of the associated property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param overrides - Optional field overrides
 * @returns Listing of type rental
 */
export function createMockRentalListing(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  overrides?: Partial<Listing>,
): Listing {
  return createMockListing(propertyId, createdBy, paymentTermsId, {
    type: "rental",
    ...overrides,
  });
}

/**
 * Create a mock short-term listing
 * @param propertyId - ID of the associated property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param overrides - Optional field overrides
 * @returns Listing of type short_term
 */
export function createMockShortTermListing(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  overrides?: Partial<Listing>,
): Listing {
  return createMockListing(propertyId, createdBy, paymentTermsId, {
    type: "short_term",
    ...overrides,
  });
}

/**
 * Create a mock published listing
 * @param propertyId - ID of the associated property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param overrides - Optional field overrides
 * @returns Published listing (status: published)
 */
export function createMockPublishedListing(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  overrides?: Partial<Listing>,
): Listing {
  return createMockListing(propertyId, createdBy, paymentTermsId, {
    status: "published",
    publishedAt: new Date(),
    ...overrides,
  });
}

/**
 * Create multiple mock listings
 * @param propertyId - ID of the property
 * @param createdBy - User ID who created the listing
 * @param paymentTermsId - Payment terms ID
 * @param count - Number of listings to create
 * @param overrides - Optional field overrides
 * @returns Array of listing entities
 */
export function createMockListings(
  propertyId: string,
  createdBy: string,
  paymentTermsId: string,
  count: number,
  overrides?: Partial<Listing>,
): Listing[] {
  return Array.from({ length: count }, (_, i) =>
    createMockListing(propertyId, createdBy, paymentTermsId, {
      id: `list-${i + 1}`,
      ...overrides,
    }),
  );
}
