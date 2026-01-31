/**
 * Test Fixtures - Aligned with Prisma Schema
 * Last Updated: 2026-01-29
 *
 * Schema-compliant test data for Property, Address, GeoObject, User, Listing
 */

/**
 * GeoObject fixtures (Point type for addresses)
 */
export const geoObjectsFixture = {
  brussels_center: {
    type: "point" as const,
    latitude: 50.8503,
    longitude: 4.3517,
    geoJson: { type: "Point", coordinates: [4.3517, 50.8503] },
  },
  antwerp_center: {
    type: "point" as const,
    latitude: 51.2211,
    longitude: 4.4014,
    geoJson: { type: "Point", coordinates: [4.4014, 51.2211] },
  },
  ghent_center: {
    type: "point" as const,
    latitude: 51.0537,
    longitude: 3.7181,
    geoJson: { type: "Point", coordinates: [3.7181, 51.0537] },
  },
  bruges_center: {
    type: "point" as const,
    latitude: 51.2093,
    longitude: 3.2244,
    geoJson: { type: "Point", coordinates: [3.2244, 51.2093] },
  },
};

/**
 * Address fixtures (streetNumber, country_code per schema)
 */
export const addressesFixture = {
  brussels_apartment: {
    streetName: "Rue de la Paix",
    streetNumber: "42",
    postalCode: "1000",
    city: "Brussels",
    region: "Brussels-Capital",
    country_code: "BE",
  },
  antwerp_studio: {
    streetName: "Grotestraat",
    streetNumber: "100",
    postalCode: "2000",
    city: "Antwerp",
    region: "Flanders",
    country_code: "BE",
  },
  ghent_house: {
    streetName: "Sint-Jacobsstraat",
    streetNumber: "55",
    postalCode: "9000",
    city: "Ghent",
    region: "East Flanders",
    country_code: "BE",
  },
  bruges_studio: {
    streetName: "Markt",
    streetNumber: "7",
    postalCode: "8000",
    city: "Bruges",
    region: "West Flanders",
    country_code: "BE",
  },
};

/**
 * Person fixtures (base table - only email/phone)
 */
export const personsFixture = {
  john_doe: {
    email: "john.doe@example.com",
    phone: "+32123456789",
  },
  jane_smith: {
    email: "jane.smith@example.com",
    phone: "+32987654321",
  },
  property_owner: {
    email: "owner@realestate.com",
    phone: "+32555666777",
  },
};

/**
 * PhysicalPerson fixtures (has firstName/lastName)
 */
export const physicalPersonsFixture = {
  john_doe: {
    firstName: "John",
    lastName: "Doe",
    nationality: "BE",
  },
  jane_smith: {
    firstName: "Jane",
    lastName: "Smith",
    nationality: "BE",
  },
  property_owner: {
    firstName: "Property",
    lastName: "Owner",
    nationality: "BE",
  },
};

/**
 * User fixtures (with role, email, passwordHash)
 */
export const usersFixture = {
  admin_user: {
    email: "admin@test.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJK", // bcrypt hash
    name: "Admin User",
    role: "admin" as const,
    isActive: true,
    country_code: "BE",
  },
  regular_user: {
    email: "user@test.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJK",
    name: "Regular User",
    role: "user" as const,
    isActive: true,
    country_code: "BE",
  },
  property_lister: {
    email: "lister@test.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJK",
    name: "Property Lister",
    role: "user" as const,
    isActive: true,
    country_code: "BE",
  },
};

/**
 * Property fixtures (propertyType, surfaceArea, userId, addressId)
 * Note: Properties don't have contractType/price - those are in Listing
 */
export const propertiesFixture = {
  apartment_brussels: {
    title: "Modern Apartment in Brussels Center",
    description: "Beautiful 2-bedroom apartment with city views",
    propertyType: "apartment" as const,
    bedrooms: 2,
    bathrooms: 1,
    surfaceArea: 65.0,
    yearBuilt: 2010,
    amenitiesList: ["balcony", "elevator", "parking"],
    isAvailable: true,
  },
  studio_antwerp: {
    title: "Cozy Studio in Antwerp",
    description: "Studio apartment near city center",
    propertyType: "apartment" as const,
    bedrooms: 0,
    bathrooms: 1,
    surfaceArea: 35.0,
    yearBuilt: 2005,
    amenitiesList: ["heating"],
    isAvailable: true,
  },
  house_ghent: {
    title: "Family House in Ghent",
    description: "4-bedroom family home with garden",
    propertyType: "house" as const,
    bedrooms: 4,
    bathrooms: 2,
    surfaceArea: 150.0,
    gardenSize: 200.0,
    yearBuilt: 1998,
    amenitiesList: ["garden", "garage", "fireplace"],
    isAvailable: true,
  },
  studio_bruges: {
    title: "Charming Studio in Bruges",
    description: "Perfect for tourists, heart of medieval city",
    propertyType: "apartment" as const,
    bedrooms: 1,
    bathrooms: 1,
    surfaceArea: 45.0,
    yearBuilt: 1850,
    amenitiesList: ["historic", "central"],
    isAvailable: true,
  },
};

/**
 * PaymentTerms fixtures (onetime, periodic)
 */
export const paymentTermsFixture = {
  sale_250k: {
    termType: "onetime" as const,
    description: "Purchase price",
    currency: "EUR",
  },
  rent_800_monthly: {
    termType: "periodic" as const,
    description: "Monthly rent",
    currency: "EUR",
  },
  rent_1500_monthly: {
    termType: "periodic" as const,
    description: "Monthly rent",
    currency: "EUR",
  },
  short_term_120_night: {
    termType: "periodic" as const,
    description: "Per night rate",
    currency: "EUR",
  },
};

/**
 * OnetimePaymentTerm fixtures
 */
export const onetimePaymentFixture = {
  sale_250k: {
    amount: 250000,
  },
};

/**
 * PeriodicPaymentTerm fixtures
 */
export const periodicPaymentFixture = {
  rent_800: {
    amountPerPeriod: 800,
    periodType: "monthly",
  },
  rent_1500: {
    amountPerPeriod: 1500,
    periodType: "monthly",
  },
  short_term_120: {
    amountPerPeriod: 120,
    periodType: "per_night",
  },
};

/**
 * Listing fixtures (type: sale/rental/short_term, status, propertyId, createdBy, paymentTermsId)
 */
export const listingsFixture = {
  sale_apartment: {
    type: "sale" as const,
    status: "published" as const,
    publishedAt: new Date("2026-01-15"),
  },
  rental_studio: {
    type: "rental" as const,
    status: "published" as const,
    publishedAt: new Date("2026-01-20"),
  },
  rental_house: {
    type: "rental" as const,
    status: "published" as const,
    publishedAt: new Date("2026-01-22"),
  },
  short_term_studio: {
    type: "short_term" as const,
    status: "published" as const,
    publishedAt: new Date("2026-01-25"),
  },
};

/**
 * SaleListing type-specific data
 */
export const saleListingFixture = {
  apartment_excellent: {
    condition: "excellent",
  },
};

/**
 * RentalListing type-specific data
 */
export const rentalListingFixture = {
  studio_basic: {
    leaseTermMonths: 12,
    utilitiesIncluded: false,
    petFriendly: false,
    furnishingStatus: "unfurnished",
    depositRequired: 800,
    autoRenew: false,
  },
  house_furnished: {
    leaseTermMonths: 12,
    utilitiesIncluded: false,
    petFriendly: true,
    petDetails: "Small pets allowed",
    furnishingStatus: "semi_furnished",
    depositRequired: 3000,
    autoRenew: false,
  },
};

/**
 * ShortTermListing type-specific data
 */
export const shortTermListingFixture = {
  studio_vacation: {
    minStayNights: 2,
    maxGuestsAllowed: 2,
    cancellationPolicy: "moderate",
    checkInTime: "15:00",
    checkOutTime: "11:00",
  },
};

/**
 * Auth fixtures (for JWT testing)
 */
export const authFixture = {
  validCredentials: {
    email: "user@test.com",
    password: "password123",
  },
  invalidCredentials: {
    email: "user@test.com",
    password: "wrongpassword",
  },
  newUser: {
    email: "newuser@test.com",
    password: "newpassword123",
    name: "New User",
  },
};

/**
 * Tegola fixture (for vector tile testing)
 */
export const tegolaFixture = {
  validTileRequest: {
    z: 10,
    x: 523,
    y: 343, // Brussels area
  },
  emptyTileRequest: {
    z: 10,
    x: 0,
    y: 0, // Ocean area
  },
  invalidZoomLevel: {
    z: 25,
    x: 100,
    y: 100,
  },
};

/**
 * Complete property chain fixture (for integration tests)
 * Creates full relational structure: GeoObject → Address → Person+PhysicalPerson → Property → User
 */
export const createPropertyChain = () => ({
  geoObject: geoObjectsFixture.brussels_center,
  address: addressesFixture.brussels_apartment,
  person: personsFixture.property_owner,
  physicalPerson: physicalPersonsFixture.property_owner,
  user: usersFixture.property_lister,
  property: propertiesFixture.apartment_brussels,
  paymentTerms: paymentTermsFixture.sale_250k,
  onetimePayment: onetimePaymentFixture.sale_250k,
  listing: listingsFixture.sale_apartment,
  saleListing: saleListingFixture.apartment_excellent,
});

/**
 * Database cleanup utilities for tests
 */
export const dbCleanup = {
  /**
   * Clean all test data from database
   */
  async cleanAll(prisma: any) {
    // Delete in order of dependencies (child tables first)
    await prisma.listing.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.geoObject.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.physicalPerson.deleteMany({});
    await prisma.person.deleteMany({});
    await prisma.paymentTerms.deleteMany({});
  },

  /**
   * Clean only users and related data
   */
  async cleanUsers(prisma: any) {
    await prisma.user.deleteMany({});
    await prisma.physicalPerson.deleteMany({});
    await prisma.person.deleteMany({});
  },

  /**
   * Clean only properties and related data
   */
  async cleanProperties(prisma: any) {
    await prisma.listing.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.geoObject.deleteMany({});
  },
};
