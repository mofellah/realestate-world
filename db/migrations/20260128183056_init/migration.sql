-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('house', 'apartment', 'villa', 'land', 'room', 'commercial', 'other');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('sale', 'rental', 'short_term', 'lease');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'published', 'paused', 'expired');

-- CreateEnum
CREATE TYPE "PaymentTermType" AS ENUM ('onetime', 'periodic', 'composite');

-- CreateEnum
CREATE TYPE "PaymentCompositionType" AS ENUM ('split', 'phased', 'combined');

-- CreateEnum
CREATE TYPE "AgencyTierType" AS ENUM ('basic', 'pro', 'premium');

-- CreateEnum
CREATE TYPE "AgencyRoleType" AS ENUM ('owner', 'manager', 'agent', 'sales_manager', 'support_agent');

-- CreateEnum
CREATE TYPE "AdminBoundaryType" AS ENUM ('admin_level_1', 'admin_level_2', 'admin_level_3', 'admin_level_4', 'admin_level_5', 'admin_level_6', 'admin_level_7', 'admin_level_8', 'admin_level_9', 'admin_level_10');

-- CreateEnum
CREATE TYPE "AmenityTypeEnum" AS ENUM ('hospital', 'school', 'park', 'shopping', 'restaurant', 'cafe', 'bank', 'pharmacy', 'gym', 'public_transport', 'library', 'police', 'fire_station', 'supermarket', 'gas_station', 'other');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'suspended', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionTierName" AS ENUM ('local', 'regional', 'national', 'premium');

-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('individual', 'organization');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('inquiry', 'response');

-- CreateEnum
CREATE TYPE "ViewType" AS ENUM ('preview', 'detail');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('listing', 'property', 'inquiry');

-- CreateEnum
CREATE TYPE "GeoObjectType" AS ENUM ('point', 'polygon', 'multipolygon', 'linestring');

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_people" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT,
    "addressId" TEXT,
    "idNumber" TEXT,
    "idType" TEXT,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessRegNumber" TEXT,
    "taxId" TEXT,
    "registrationCountry" TEXT NOT NULL,
    "addressId" TEXT,
    "contactFirstName" TEXT,
    "contactLastName" TEXT,
    "contactTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "country_code" TEXT,
    "personId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_objects" (
    "id" TEXT NOT NULL,
    "type" "GeoObjectType" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geoJson" JSONB,
    "name" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "streetNumber" TEXT,
    "unit" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "country_code" TEXT NOT NULL,
    "geoObjectId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "addressId" TEXT NOT NULL,
    "ownerPersonId" TEXT NOT NULL,
    "userId" TEXT,
    "ownerDocumentUrl" TEXT,
    "propertyType" "PropertyType" NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "surfaceArea" DOUBLE PRECISION,
    "gardenSize" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "amenitiesList" TEXT[],
    "metadata" JSONB,
    "parentPropertyId" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_terms" (
    "id" TEXT NOT NULL,
    "termType" "PaymentTermType" NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onetime_payment_terms" (
    "id" TEXT NOT NULL,
    "paymentTermsId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "installmentCount" INTEGER,
    "installmentAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onetime_payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodic_payment_terms" (
    "id" TEXT NOT NULL,
    "paymentTermsId" TEXT NOT NULL,
    "amountPerPeriod" DOUBLE PRECISION NOT NULL,
    "periodType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodic_payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composite_payment_terms" (
    "id" TEXT NOT NULL,
    "paymentTermsId" TEXT NOT NULL,
    "compositionType" "PaymentCompositionType" NOT NULL,
    "componentTerms" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "composite_payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "paymentTermsId" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "visibilityStart" TIMESTAMP(3),
    "visibilityEnd" TIMESTAMP(3),
    "visibilityDays" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_listings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "condition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_listings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "leaseTermMonths" INTEGER,
    "utilitiesIncluded" BOOLEAN NOT NULL DEFAULT false,
    "utilitiesDetails" TEXT,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "petDetails" TEXT,
    "furnishingStatus" TEXT,
    "depositRequired" DOUBLE PRECISION,
    "depositPercent" DOUBLE PRECISION,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_term_listings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "minStayNights" INTEGER,
    "maxGuestsAllowed" INTEGER,
    "cancellationPolicy" TEXT,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_term_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_listings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "leaseType" TEXT,
    "leaseTermYears" INTEGER,
    "renewalOptions" BOOLEAN NOT NULL DEFAULT false,
    "securityDeposit" DOUBLE PRECISION,
    "commercialUseAllowed" BOOLEAN NOT NULL DEFAULT false,
    "businessType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "tier" "AgencyTierType" NOT NULL DEFAULT 'basic',
    "profileImageUrl" TEXT,
    "description" TEXT,
    "maxAgents" INTEGER NOT NULL DEFAULT 5,
    "maxListings" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "role" "AgencyRoleType" NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geographical_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentAreaId" TEXT,
    "geoObjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geographical_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_boundaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialCode" TEXT,
    "boundaryType" "AdminBoundaryType" NOT NULL,
    "country_code" TEXT NOT NULL,
    "parentBoundaryId" TEXT,
    "geoObjectId" TEXT,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_boundaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AmenityTypeEnum" NOT NULL,
    "geoObjectId" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country_code" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "openingHours" TEXT,
    "avgRating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_amenities" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "specializations" TEXT[],
    "beds" INTEGER,
    "emergencyDept" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_amenities" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "grades" INTEGER[],
    "type" TEXT,
    "pupils" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_amenities" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "cuisine" TEXT,
    "seatsAvailable" INTEGER,
    "priceRange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_stop_amenities" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "lines" TEXT[],
    "frequency" TEXT,
    "accessibility" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transit_stop_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "subjectType" "SubjectType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_subjects" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subjectId" TEXT,
    "threadId" TEXT,
    "messageType" "MessageType" NOT NULL DEFAULT 'inquiry',
    "subject_line" TEXT,
    "body" TEXT NOT NULL,
    "distributionList" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "viewerId" TEXT,
    "viewType" "ViewType" NOT NULL DEFAULT 'preview',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "planType" "SubscriptionPlanType" NOT NULL,
    "tierName" "SubscriptionTierName" NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "features" JSONB,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_subscription_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxListingsActive" INTEGER NOT NULL,
    "maxAreas" INTEGER NOT NULL,
    "hasAdvancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "individual_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_subscription_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "maxAgents" INTEGER NOT NULL,
    "maxListingsActive" INTEGER NOT NULL,
    "maxAreas" INTEGER NOT NULL,
    "hasTeamManagement" BOOLEAN NOT NULL DEFAULT true,
    "hasAdvancedAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "physical_people_personId_key" ON "physical_people"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "physical_people_idNumber_key" ON "physical_people"("idNumber");

-- CreateIndex
CREATE INDEX "physical_people_personId_idx" ON "physical_people"("personId");

-- CreateIndex
CREATE INDEX "physical_people_addressId_idx" ON "physical_people"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_personId_key" ON "organizations"("personId");

-- CreateIndex
CREATE INDEX "organizations_personId_idx" ON "organizations"("personId");

-- CreateIndex
CREATE INDEX "organizations_addressId_idx" ON "organizations"("addressId");

-- CreateIndex
CREATE INDEX "organizations_registrationCountry_idx" ON "organizations"("registrationCountry");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_personId_key" ON "users"("personId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_country_code_idx" ON "users"("country_code");

-- CreateIndex
CREATE INDEX "geo_objects_type_idx" ON "geo_objects"("type");

-- CreateIndex
CREATE INDEX "geo_objects_latitude_longitude_idx" ON "geo_objects"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "addresses_postalCode_idx" ON "addresses"("postalCode");

-- CreateIndex
CREATE INDEX "addresses_city_idx" ON "addresses"("city");

-- CreateIndex
CREATE INDEX "addresses_country_code_idx" ON "addresses"("country_code");

-- CreateIndex
CREATE INDEX "addresses_geoObjectId_idx" ON "addresses"("geoObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_streetName_streetNumber_unit_postalCode_country_c_key" ON "addresses"("streetName", "streetNumber", "unit", "postalCode", "country_code");

-- CreateIndex
CREATE INDEX "properties_userId_idx" ON "properties"("userId");

-- CreateIndex
CREATE INDEX "properties_ownerPersonId_idx" ON "properties"("ownerPersonId");

-- CreateIndex
CREATE INDEX "properties_addressId_idx" ON "properties"("addressId");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "payment_terms_termType_idx" ON "payment_terms"("termType");

-- CreateIndex
CREATE UNIQUE INDEX "onetime_payment_terms_paymentTermsId_key" ON "onetime_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE INDEX "onetime_payment_terms_paymentTermsId_idx" ON "onetime_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE UNIQUE INDEX "periodic_payment_terms_paymentTermsId_key" ON "periodic_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE INDEX "periodic_payment_terms_paymentTermsId_idx" ON "periodic_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE UNIQUE INDEX "composite_payment_terms_paymentTermsId_key" ON "composite_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE INDEX "composite_payment_terms_paymentTermsId_idx" ON "composite_payment_terms"("paymentTermsId");

-- CreateIndex
CREATE INDEX "listings_propertyId_idx" ON "listings"("propertyId");

-- CreateIndex
CREATE INDEX "listings_createdBy_idx" ON "listings"("createdBy");

-- CreateIndex
CREATE INDEX "listings_paymentTermsId_idx" ON "listings"("paymentTermsId");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_type_idx" ON "listings"("type");

-- CreateIndex
CREATE INDEX "listings_visibilityEnd_idx" ON "listings"("visibilityEnd");

-- CreateIndex
CREATE UNIQUE INDEX "sale_listings_listingId_key" ON "sale_listings"("listingId");

-- CreateIndex
CREATE INDEX "sale_listings_listingId_idx" ON "sale_listings"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_listings_listingId_key" ON "rental_listings"("listingId");

-- CreateIndex
CREATE INDEX "rental_listings_listingId_idx" ON "rental_listings"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "short_term_listings_listingId_key" ON "short_term_listings"("listingId");

-- CreateIndex
CREATE INDEX "short_term_listings_listingId_idx" ON "short_term_listings"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_listings_listingId_key" ON "lease_listings"("listingId");

-- CreateIndex
CREATE INDEX "lease_listings_listingId_idx" ON "lease_listings"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_personId_key" ON "agencies"("personId");

-- CreateIndex
CREATE INDEX "agencies_personId_idx" ON "agencies"("personId");

-- CreateIndex
CREATE INDEX "agencies_tier_idx" ON "agencies"("tier");

-- CreateIndex
CREATE INDEX "agency_roles_agencyId_idx" ON "agency_roles"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "agency_roles_userId_agencyId_key" ON "agency_roles"("userId", "agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "geographical_areas_code_key" ON "geographical_areas"("code");

-- CreateIndex
CREATE INDEX "geographical_areas_code_idx" ON "geographical_areas"("code");

-- CreateIndex
CREATE INDEX "geographical_areas_geoObjectId_idx" ON "geographical_areas"("geoObjectId");

-- CreateIndex
CREATE INDEX "admin_boundaries_country_code_idx" ON "admin_boundaries"("country_code");

-- CreateIndex
CREATE INDEX "admin_boundaries_boundaryType_idx" ON "admin_boundaries"("boundaryType");

-- CreateIndex
CREATE INDEX "admin_boundaries_geoObjectId_idx" ON "admin_boundaries"("geoObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_boundaries_name_country_code_boundaryType_key" ON "admin_boundaries"("name", "country_code", "boundaryType");

-- CreateIndex
CREATE INDEX "amenities_type_idx" ON "amenities"("type");

-- CreateIndex
CREATE INDEX "amenities_geoObjectId_idx" ON "amenities"("geoObjectId");

-- CreateIndex
CREATE INDEX "amenities_city_idx" ON "amenities"("city");

-- CreateIndex
CREATE INDEX "amenities_country_code_idx" ON "amenities"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_amenities_amenityId_key" ON "hospital_amenities"("amenityId");

-- CreateIndex
CREATE INDEX "hospital_amenities_amenityId_idx" ON "hospital_amenities"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "school_amenities_amenityId_key" ON "school_amenities"("amenityId");

-- CreateIndex
CREATE INDEX "school_amenities_amenityId_idx" ON "school_amenities"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_amenities_amenityId_key" ON "restaurant_amenities"("amenityId");

-- CreateIndex
CREATE INDEX "restaurant_amenities_amenityId_idx" ON "restaurant_amenities"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "transit_stop_amenities_amenityId_key" ON "transit_stop_amenities"("amenityId");

-- CreateIndex
CREATE INDEX "transit_stop_amenities_amenityId_idx" ON "transit_stop_amenities"("amenityId");

-- CreateIndex
CREATE INDEX "subjects_subjectType_idx" ON "subjects"("subjectType");

-- CreateIndex
CREATE UNIQUE INDEX "listing_subjects_subjectId_key" ON "listing_subjects"("subjectId");

-- CreateIndex
CREATE INDEX "listing_subjects_subjectId_idx" ON "listing_subjects"("subjectId");

-- CreateIndex
CREATE INDEX "listing_subjects_listingId_idx" ON "listing_subjects"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_subjects_listingId_key" ON "listing_subjects"("listingId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_recipientId_idx" ON "messages"("recipientId");

-- CreateIndex
CREATE INDEX "messages_subjectId_idx" ON "messages"("subjectId");

-- CreateIndex
CREATE INDEX "messages_threadId_idx" ON "messages"("threadId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "views_listingId_idx" ON "views"("listingId");

-- CreateIndex
CREATE INDEX "views_viewerId_idx" ON "views"("viewerId");

-- CreateIndex
CREATE INDEX "views_timestamp_idx" ON "views"("timestamp");

-- CreateIndex
CREATE INDEX "subscription_plans_planType_idx" ON "subscription_plans"("planType");

-- CreateIndex
CREATE INDEX "subscription_plans_status_idx" ON "subscription_plans"("status");

-- CreateIndex
CREATE INDEX "subscription_plans_renewalDate_idx" ON "subscription_plans"("renewalDate");

-- CreateIndex
CREATE UNIQUE INDEX "individual_subscription_plans_planId_key" ON "individual_subscription_plans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "individual_subscription_plans_userId_key" ON "individual_subscription_plans"("userId");

-- CreateIndex
CREATE INDEX "individual_subscription_plans_userId_idx" ON "individual_subscription_plans"("userId");

-- CreateIndex
CREATE INDEX "individual_subscription_plans_planId_idx" ON "individual_subscription_plans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_subscription_plans_planId_key" ON "organization_subscription_plans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_subscription_plans_agencyId_key" ON "organization_subscription_plans"("agencyId");

-- CreateIndex
CREATE INDEX "organization_subscription_plans_agencyId_idx" ON "organization_subscription_plans"("agencyId");

-- CreateIndex
CREATE INDEX "organization_subscription_plans_planId_idx" ON "organization_subscription_plans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- AddForeignKey
ALTER TABLE "physical_people" ADD CONSTRAINT "physical_people_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_people" ADD CONSTRAINT "physical_people_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_geoObjectId_fkey" FOREIGN KEY ("geoObjectId") REFERENCES "geo_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_parentPropertyId_fkey" FOREIGN KEY ("parentPropertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onetime_payment_terms" ADD CONSTRAINT "onetime_payment_terms_paymentTermsId_fkey" FOREIGN KEY ("paymentTermsId") REFERENCES "payment_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_payment_terms" ADD CONSTRAINT "periodic_payment_terms_paymentTermsId_fkey" FOREIGN KEY ("paymentTermsId") REFERENCES "payment_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_payment_terms" ADD CONSTRAINT "composite_payment_terms_paymentTermsId_fkey" FOREIGN KEY ("paymentTermsId") REFERENCES "payment_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_paymentTermsId_fkey" FOREIGN KEY ("paymentTermsId") REFERENCES "payment_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_listings" ADD CONSTRAINT "sale_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_listings" ADD CONSTRAINT "rental_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_term_listings" ADD CONSTRAINT "short_term_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_listings" ADD CONSTRAINT "lease_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_roles" ADD CONSTRAINT "agency_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_roles" ADD CONSTRAINT "agency_roles_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geographical_areas" ADD CONSTRAINT "geographical_areas_parentAreaId_fkey" FOREIGN KEY ("parentAreaId") REFERENCES "geographical_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geographical_areas" ADD CONSTRAINT "geographical_areas_geoObjectId_fkey" FOREIGN KEY ("geoObjectId") REFERENCES "geo_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_boundaries" ADD CONSTRAINT "admin_boundaries_parentBoundaryId_fkey" FOREIGN KEY ("parentBoundaryId") REFERENCES "admin_boundaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_boundaries" ADD CONSTRAINT "admin_boundaries_geoObjectId_fkey" FOREIGN KEY ("geoObjectId") REFERENCES "geo_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_geoObjectId_fkey" FOREIGN KEY ("geoObjectId") REFERENCES "geo_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_amenities" ADD CONSTRAINT "hospital_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_amenities" ADD CONSTRAINT "school_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_amenities" ADD CONSTRAINT "restaurant_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_stop_amenities" ADD CONSTRAINT "transit_stop_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_subjects" ADD CONSTRAINT "listing_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_subjects" ADD CONSTRAINT "listing_subjects_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_subjects" ADD CONSTRAINT "listing_subjects_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_subscription_plans" ADD CONSTRAINT "individual_subscription_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_subscription_plans" ADD CONSTRAINT "individual_subscription_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscription_plans" ADD CONSTRAINT "organization_subscription_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscription_plans" ADD CONSTRAINT "organization_subscription_plans_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
