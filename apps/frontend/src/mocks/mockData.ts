// Mock data generators aligned with Prisma schema
import {
  User,
  UserRole,
  Person,
  PhysicalPerson,
  Property,
  PropertyType,
  Address,
  GeoObject,
  Listing,
  ListingType,
  ListingStatus,
  PaymentTermType,
  OnetimePaymentTerm,
  PeriodicPaymentTerm,
  Amenity,
  AmenityTypeEnum,
  Message,
  MessageType,
} from '../types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = (prefix: string = '') => 
  `${prefix}${Math.random().toString(36).substr(2, 9)}`;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomBoolean = () => Math.random() > 0.5;

// ============================================================================
// GEO DATA
// ============================================================================

const CITIES = {
  BE: [
    { name: 'Brussels', lat: 50.8503, lng: 4.3517, region: 'Brussels-Capital' },
    { name: 'Antwerp', lat: 51.2194, lng: 4.4025, region: 'Flanders' },
    { name: 'Ghent', lat: 51.0543, lng: 3.7174, region: 'Flanders' },
    { name: 'Bruges', lat: 51.2093, lng: 3.2247, region: 'Flanders' },
    { name: 'Liège', lat: 50.6326, lng: 5.5797, region: 'Wallonia' },
  ],
  NL: [
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, region: 'North Holland' },
    { name: 'Rotterdam', lat: 51.9225, lng: 4.4792, region: 'South Holland' },
    { name: 'The Hague', lat: 52.0705, lng: 4.3007, region: 'South Holland' },
    { name: 'Utrecht', lat: 52.0907, lng: 5.1214, region: 'Utrecht' },
    { name: 'Eindhoven', lat: 51.4416, lng: 5.4697, region: 'North Brabant' },
  ],
  CH: [
    { name: 'Zurich', lat: 47.3769, lng: 8.5417, region: 'Zurich' },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432, region: 'Geneva' },
    { name: 'Basel', lat: 47.5596, lng: 7.5886, region: 'Basel-Stadt' },
    { name: 'Bern', lat: 46.9480, lng: 7.4474, region: 'Bern' },
    { name: 'Lausanne', lat: 46.5197, lng: 6.6323, region: 'Vaud' },
  ],
};

const ALL_CITIES = [...CITIES.BE, ...CITIES.NL, ...CITIES.CH];

const STREET_NAMES = [
  'Rue de la Loi', 'Avenue Louise', 'Chaussée de Waterloo', 'Rue Neuve',
  'Herengracht', 'Keizersgracht', 'Prinsengracht', 'Damrak',
  'Bahnhofstrasse', 'Limmatquai', 'Uraniastrasse', 'Sihlstrasse',
];

const PROPERTY_TITLES = [
  'Charming Apartment in City Center',
  'Modern Villa with Garden',
  'Luxury Penthouse with Panoramic Views',
  'Cozy Studio Near Metro',
  'Spacious Family Home',
  'Renovated Loft in Historic Building',
  'Contemporary Duplex',
  'Bright Apartment with Balcony',
  'Traditional Townhouse',
  'Elegant Manor with Pool',
];

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export function generateGeoObject(
  type: 'point' | 'polygon' = 'point',
  lat?: number,
  lng?: number
): GeoObject {
  return {
    id: generateId('geo_'),
    type,
    latitude: lat ?? randomInt(4600, 5200) / 100,
    longitude: lng ?? randomInt(300, 850) / 100,
    geoJson: null,
    name: undefined,
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateAddress(country_code: 'BE' | 'NL' | 'CH' = 'BE'): Address {
  const city = randomChoice(CITIES[country_code]);
  const streetName = randomChoice(STREET_NAMES);
  const geoObject = generateGeoObject('point', 
    city.lat + (Math.random() - 0.5) * 0.1, 
    city.lng + (Math.random() - 0.5) * 0.1
  );

  return {
    id: generateId('addr_'),
    streetName,
    streetNumber: randomInt(1, 300).toString(),
    unit: randomBoolean() ? randomInt(1, 50).toString() : undefined,
    postalCode: randomInt(1000, 9999).toString(),
    city: city.name,
    region: city.region,
    country_code,
    geoObjectId: geoObject.id,
    geoObject,
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generatePerson(): Person {
  return {
    id: generateId('person_'),
    email: `user${randomInt(1000, 9999)}@example.com`,
    phone: `+32${randomInt(100000000, 999999999)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generatePhysicalPerson(person?: Person): PhysicalPerson {
  const personData = person || generatePerson();
  const firstNames = ['Jan', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anna', 'Thomas', 'Emma'];
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Leroy'];

  return {
    id: generateId('phys_'),
    personId: personData.id,
    person: personData,
    firstName: randomChoice(firstNames),
    lastName: randomChoice(lastNames),
    nationality: randomChoice(['BE', 'NL', 'CH', 'FR', 'DE']),
    addressId: undefined,
    address: undefined,
    idNumber: `ID${randomInt(100000, 999999)}`,
    idType: 'national_id',
    idVerified: randomBoolean(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateUser(role: UserRole = UserRole.USER): User {
  const person = generatePerson();
  const physicalPerson = generatePhysicalPerson(person);

  return {
    id: generateId('user_'),
    email: person.email,
    avatarUrl: `https://i.pravatar.cc/150?u=${person.id}`,
    role,
    isActive: true,
    country_code: randomChoice(['BE', 'NL', 'CH']),
    personId: person.id,
    person,
    physicalPerson,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateProperty(owner?: User): Property {
  const address = generateAddress(randomChoice(['BE', 'NL', 'CH']));
  const propertyType = randomChoice(Object.values(PropertyType));
  const ownerUser = owner || generateUser();
  
  return {
    id: generateId('prop_'),
    title: randomChoice(PROPERTY_TITLES),
    description: `Beautiful ${propertyType} in ${address.city}. Recently renovated with modern amenities. Perfect for families or professionals.`,
    addressId: address.id,
    address,
    ownerPersonId: ownerUser.personId!,
    ownerPerson: ownerUser.person!,
    userId: ownerUser.id,
    user: ownerUser,
    ownerDocumentUrl: undefined,
    propertyType,
    bedrooms: propertyType === PropertyType.LAND ? undefined : randomInt(1, 5),
    bathrooms: propertyType === PropertyType.LAND ? undefined : randomInt(1, 3),
    surfaceArea: randomInt(40, 300),
    gardenSize: randomBoolean() ? randomInt(20, 500) : undefined,
    yearBuilt: randomInt(1950, 2023),
    amenitiesList: ['parking', 'elevator', 'balcony'].filter(() => randomBoolean()),
    metadata: null,
    parentPropertyId: undefined,
    isAvailable: true,
    images: Array.from({ length: randomInt(5, 15) }, (_, i) => 
      `https://picsum.photos/800/600?random=${generateId()}&property=${i}`
    ),
    createdAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generatePaymentTerms(
  type: PaymentTermType = PaymentTermType.ONETIME
): OnetimePaymentTerm | PeriodicPaymentTerm {
  const base = {
    id: generateId('payment_'),
    description: undefined,
    currency: 'EUR',
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (type === PaymentTermType.ONETIME) {
    return {
      ...base,
      termType: PaymentTermType.ONETIME,
      amount: randomInt(50000, 800000),
      installmentCount: undefined,
      installmentAmount: undefined,
    };
  } else {
    return {
      ...base,
      termType: PaymentTermType.PERIODIC,
      amountPerPeriod: randomInt(500, 5000),
      periodType: randomChoice(['monthly', 'quarterly', 'annual']),
    };
  }
}

export function generateListing(property?: Property, creator?: User): Listing {
  const prop = property || generateProperty();
  const user = creator || (prop.user as User);
  const type = randomChoice(Object.values(ListingType));
  
  const paymentTermType = type === ListingType.SALE 
    ? PaymentTermType.ONETIME 
    : PaymentTermType.PERIODIC;
  
  const paymentTerms = generatePaymentTerms(paymentTermType);

  const baseListing = {
    id: generateId('listing_'),
    type,
    propertyId: prop.id,
    property: prop,
    createdBy: user.id,
    creator: user,
    paymentTermsId: paymentTerms.id,
    paymentTerms,
    status: randomChoice([ListingStatus.PUBLISHED, ListingStatus.PUBLISHED, ListingStatus.DRAFT]),
    visibilityStart: new Date().toISOString(),
    visibilityEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    visibilityDays: 30,
    publishedAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: randomInt(10, 500),
    inquiryCount: randomInt(0, 50),
    createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (type) {
    case ListingType.SALE:
      return {
        ...baseListing,
        type: ListingType.SALE,
        saleDetails: {
          condition: randomChoice(['excellent', 'good', 'fair', 'needs_work']),
        },
      };
    case ListingType.RENTAL:
      return {
        ...baseListing,
        type: ListingType.RENTAL,
        rentalDetails: {
          leaseTermMonths: randomInt(6, 24),
          utilitiesIncluded: randomBoolean(),
          utilitiesDetails: 'Water and heating included',
          petFriendly: randomBoolean(),
          petDetails: 'Small pets allowed',
          furnishingStatus: randomChoice(['unfurnished', 'semi_furnished', 'furnished']),
          depositRequired: (paymentTerms as PeriodicPaymentTerm).amountPerPeriod * 2,
          depositPercent: 200,
          autoRenew: randomBoolean(),
        },
      };
    case ListingType.SHORT_TERM:
      return {
        ...baseListing,
        type: ListingType.SHORT_TERM,
        shortTermDetails: {
          minStayNights: randomChoice([1, 3, 7]),
          maxGuestsAllowed: randomInt(2, 8),
          cancellationPolicy: randomChoice(['flexible', 'moderate', 'strict']),
          checkInTime: '15:00',
          checkOutTime: '11:00',
        },
      };
    case ListingType.LEASE:
      return {
        ...baseListing,
        type: ListingType.LEASE,
        leaseDetails: {
          leaseType: randomChoice(['residential', 'commercial', 'mixed_use']),
          leaseTermYears: randomInt(1, 10),
          renewalOptions: randomBoolean(),
          securityDeposit: (paymentTerms as PeriodicPaymentTerm).amountPerPeriod * 3,
          commercialUseAllowed: randomBoolean(),
          businessType: 'Office space',
        },
      };
    default:
      return baseListing as any;
  }
}

export function generateAmenity(type: AmenityTypeEnum = AmenityTypeEnum.SCHOOL): Amenity {
  const city = randomChoice(ALL_CITIES);
  const geoObject = generateGeoObject('point', 
    city.lat + (Math.random() - 0.5) * 0.05, 
    city.lng + (Math.random() - 0.5) * 0.05
  );

  const base: Amenity = {
    id: generateId('amenity_'),
    name: `${type} ${randomInt(1, 100)}`,
    type,
    geoObjectId: geoObject.id,
    geoObject,
    address: `${randomChoice(STREET_NAMES)} ${randomInt(1, 200)}`,
    city: city.name,
    country_code: randomChoice(['BE', 'NL', 'CH']),
    phone: `+32${randomInt(100000000, 999999999)}`,
    website: `https://example.com/${type}`,
    openingHours: '9:00-18:00',
    avgRating: randomInt(30, 50) / 10,
    reviewCount: randomInt(10, 500),
    metadata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return base;
}

export function generateMessage(sender: User, recipient: User): Message {
  return {
    id: generateId('msg_'),
    senderId: sender.id,
    sender,
    recipientId: recipient.id,
    recipient,
    subjectId: undefined,
    threadId: generateId('thread_'),
    messageType: MessageType.INQUIRY,
    subject_line: 'Inquiry about property',
    body: 'Hello, I am interested in viewing this property. When would be a good time?',
    distributionList: null,
    isRead: randomBoolean(),
    createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ============================================================================
// BULK GENERATORS
// ============================================================================

export function generateMockUsers(count: number = 10): User[] {
  return Array.from({ length: count }, () => generateUser());
}

export function generateMockProperties(count: number = 50, owners?: User[]): Property[] {
  return Array.from({ length: count }, () => {
    const owner = owners ? randomChoice(owners) : undefined;
    return generateProperty(owner);
  });
}

export function generateMockListings(count: number = 50, properties?: Property[]): Listing[] {
  return Array.from({ length: count }, () => {
    const property = properties ? randomChoice(properties) : undefined;
    return generateListing(property);
  });
}

export function generateMockAmenities(count: number = 100): Amenity[] {
  const types = Object.values(AmenityTypeEnum);
  return Array.from({ length: count }, () => {
    const type = randomChoice(types);
    return generateAmenity(type);
  });
}

// ============================================================================
// EXPORT MOCK DATABASE
// ============================================================================

export const mockDatabase = {
  users: generateMockUsers(10),
  properties: [] as Property[],
  listings: [] as Listing[],
  amenities: generateMockAmenities(100),
  messages: [] as Message[],
};

// Initialize properties and listings
mockDatabase.properties = generateMockProperties(50, mockDatabase.users);
mockDatabase.listings = generateMockListings(80, mockDatabase.properties);

// Generate some messages
const messagePairs = Array.from({ length: 20 }, () => {
  const sender = randomChoice(mockDatabase.users);
  const recipient = randomChoice(mockDatabase.users.filter(u => u.id !== sender.id));
  return generateMessage(sender, recipient);
});
mockDatabase.messages = messagePairs;

export default mockDatabase;
