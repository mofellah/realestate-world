// Frontend types aligned with Prisma schema
// Auto-generated from db/schema.prisma

// ============================================================================
// ENUMS (matching Prisma)
// ============================================================================

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum PropertyType {
  HOUSE = "house",
  APARTMENT = "apartment",
  VILLA = "villa",
  LAND = "land",
  ROOM = "room",
  COMMERCIAL = "commercial",
  OTHER = "other",
}

export enum ListingType {
  SALE = "sale",
  RENTAL = "rental",
  SHORT_TERM = "short_term",
  LEASE = "lease",
}

export enum ListingStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  PAUSED = "paused",
  EXPIRED = "expired",
}

export enum PaymentTermType {
  ONETIME = "onetime",
  PERIODIC = "periodic",
  COMPOSITE = "composite",
}

export enum AgencyTierType {
  BASIC = "basic",
  PRO = "pro",
  PREMIUM = "premium",
}

export enum AgencyRoleType {
  OWNER = "owner",
  MANAGER = "manager",
  AGENT = "agent",
  SALES_MANAGER = "sales_manager",
  SUPPORT_AGENT = "support_agent",
}

export enum AmenityTypeEnum {
  HOSPITAL = "hospital",
  SCHOOL = "school",
  PARK = "park",
  SHOPPING = "shopping",
  RESTAURANT = "restaurant",
  CAFE = "cafe",
  BANK = "bank",
  PHARMACY = "pharmacy",
  GYM = "gym",
  PUBLIC_TRANSPORT = "public_transport",
  LIBRARY = "library",
  POLICE = "police",
  FIRE_STATION = "fire_station",
  SUPERMARKET = "supermarket",
  GAS_STATION = "gas_station",
  OTHER = "other",
}

export enum MessageType {
  INQUIRY = "inquiry",
  RESPONSE = "response",
}

export enum ViewType {
  PREVIEW = "preview",
  DETAIL = "detail",
}

// ============================================================================
// BASE MODELS
// ============================================================================

export interface Person {
  id: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalPerson {
  id: string;
  personId: string;
  person: Person;
  firstName: string;
  lastName: string;
  nationality?: string;
  addressId?: string;
  address?: Address;
  idNumber?: string;
  idType?: string;
  idVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  personId: string;
  person: Person;
  businessName: string;
  businessRegNumber?: string;
  taxId?: string;
  registrationCountry: string;
  addressId?: string;
  address?: Address;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  country_code?: string;
  personId?: string;
  person?: Person;
  physicalPerson?: PhysicalPerson;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface GeoObject {
  id: string;
  type: "point" | "polygon" | "multipolygon" | "linestring";
  latitude?: number;
  longitude?: number;
  geoJson?: any;
  name?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  streetName: string;
  streetNumber?: string;
  unit?: string;
  postalCode: string;
  city: string;
  region?: string;
  country_code: string;
  geoObjectId?: string;
  geoObject?: GeoObject;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  addressId: string;
  address: Address;
  ownerPersonId: string;
  ownerPerson: Person;
  userId?: string;
  user?: User;
  ownerDocumentUrl?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  gardenSize?: number;
  yearBuilt?: number;
  amenitiesList: string[];
  metadata?: any;
  parentPropertyId?: string;
  isAvailable: boolean;
  images?: string[]; // Extended field for frontend
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PAYMENT TERMS (Polymorphic)
// ============================================================================

export interface PaymentTermsBase {
  id: string;
  termType: PaymentTermType;
  description?: string;
  currency: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface OnetimePaymentTerm extends PaymentTermsBase {
  termType: PaymentTermType.ONETIME;
  amount: number;
  installmentCount?: number;
  installmentAmount?: number;
}

export interface PeriodicPaymentTerm extends PaymentTermsBase {
  termType: PaymentTermType.PERIODIC;
  amountPerPeriod: number;
  periodType: string; // "monthly", "quarterly", "annual", etc.
}

export interface CompositePaymentTerm extends PaymentTermsBase {
  termType: PaymentTermType.COMPOSITE;
  compositionType: "split" | "phased" | "combined";
  componentTerms: any; // JSON array
}

export type PaymentTerms = OnetimePaymentTerm | PeriodicPaymentTerm | CompositePaymentTerm;

// ============================================================================
// LISTINGS (Polymorphic by type)
// ============================================================================

export interface ListingBase {
  id: string;
  type: ListingType;
  propertyId: string;
  property: Property;
  createdBy: string;
  creator: User;
  paymentTermsId: string;
  paymentTerms: PaymentTerms;
  status: ListingStatus;
  visibilityStart?: string;
  visibilityEnd?: string;
  visibilityDays?: number;
  publishedAt?: string;
  viewCount?: number; // Extended field
  inquiryCount?: number; // Extended field
  createdAt: string;
  updatedAt: string;
}

export interface SaleListing extends ListingBase {
  type: ListingType.SALE;
  saleDetails: {
    condition?: string; // excellent, good, fair, needs_work
  };
}

export interface RentalListing extends ListingBase {
  type: ListingType.RENTAL;
  rentalDetails: {
    leaseTermMonths?: number;
    utilitiesIncluded: boolean;
    utilitiesDetails?: string;
    petFriendly: boolean;
    petDetails?: string;
    furnishingStatus?: string;
    depositRequired?: number;
    depositPercent?: number;
    autoRenew: boolean;
  };
}

export interface ShortTermListing extends ListingBase {
  type: ListingType.SHORT_TERM;
  shortTermDetails: {
    minStayNights?: number;
    maxGuestsAllowed?: number;
    cancellationPolicy?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
}

export interface LeaseListing extends ListingBase {
  type: ListingType.LEASE;
  leaseDetails: {
    leaseType?: string;
    leaseTermYears?: number;
    renewalOptions: boolean;
    securityDeposit?: number;
    commercialUseAllowed: boolean;
    businessType?: string;
  };
}

export type Listing = SaleListing | RentalListing | ShortTermListing | LeaseListing;

// ============================================================================
// AGENCY
// ============================================================================

export interface Agency {
  id: string;
  personId: string;
  person: Person;
  organization: Organization;
  tier: AgencyTierType;
  profileImageUrl?: string;
  description?: string;
  maxAgents: number;
  maxListings: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyRole {
  id: string;
  userId: string;
  user: User;
  agencyId: string;
  agency: Agency;
  role: AgencyRoleType;
  permissions?: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AMENITIES (Polymorphic by type)
// ============================================================================

export interface AmenityBase {
  id: string;
  name: string;
  type: AmenityTypeEnum;
  geoObjectId: string;
  geoObject: GeoObject;
  address?: string;
  city?: string;
  country_code: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  avgRating?: number;
  reviewCount?: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalAmenity extends AmenityBase {
  type: AmenityTypeEnum.HOSPITAL;
  hospitalDetails: {
    specializations: string[];
    beds?: number;
    emergencyDept: boolean;
  };
}

export interface SchoolAmenity extends AmenityBase {
  type: AmenityTypeEnum.SCHOOL;
  schoolDetails: {
    grades: number[];
    type?: string;
    pupils?: number;
  };
}

export interface RestaurantAmenity extends AmenityBase {
  type: AmenityTypeEnum.RESTAURANT;
  restaurantDetails: {
    cuisine?: string;
    seatsAvailable?: number;
    priceRange?: string;
  };
}

export interface TransitStopAmenity extends AmenityBase {
  type: AmenityTypeEnum.PUBLIC_TRANSPORT;
  transitDetails: {
    lines: string[];
    frequency?: string;
    accessibility: boolean;
  };
}

export type Amenity =
  | HospitalAmenity
  | SchoolAmenity
  | RestaurantAmenity
  | TransitStopAmenity
  | AmenityBase;

// ============================================================================
// MESSAGES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  subjectId?: string;
  threadId?: string;
  messageType: MessageType;
  subject_line?: string;
  body: string;
  distributionList?: any;
  isRead: boolean;
  createdAt: string;
}

export interface View {
  id: string;
  listingId: string;
  listing?: Listing;
  viewerId?: string;
  viewer?: User;
  viewType: ViewType;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ============================================================================
// SEARCH & FILTERS
// ============================================================================

export interface SearchFilters {
  propertyType?: PropertyType[];
  listingType?: ListingType[];
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  surfaceAreaMin?: number;
  surfaceAreaMax?: number;
  city?: string;
  region?: string;
  country_code?: string;
  amenities?: AmenityTypeEnum[];
  amenityDistance?: number; // in meters
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
