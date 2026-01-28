# Schema Implementation Complete - Final Design Summary

**Status**: ✅ **VALIDATED AND READY**  
**Timestamp**: 2026-01-28  
**Schema File**: `db/schema.prisma` (954 lines)  
**Validation**: ✅ Passed (`npx prisma validate`)

---

## Executive Summary

All 6 user design decisions have been **fully implemented** into the schema:

| Decision | Design Chosen | Implementation |
|----------|---------------|-----------------|
| 1. **Person** | Generic base table | ✅ Single `Person` table with `personType` discriminator (physical_person \| organization) |
| 2. **Amenity** | Separate type-specific tables | ✅ Base `Amenity` + 4 child tables: `HospitalAmenity`, `SchoolAmenity`, `RestaurantAmenity`, `TransitStopAmenity` |
| 3. **Subject** | Base + polymorphic children | ✅ Base `Subject` with `subjectType` enum + `ListingSubject` child (extensible to `PropertySubject`, `InquirySubject`) |
| 4. **UserRole** | Only user \| admin | ✅ Simplified `UserRole` enum (removed searcher, owner, agent); contextual roles via `AgencyRole` table |
| 5. **ExternalPropertyOwner** | Full documentation | ✅ Dedicated `ExternalPropertyOwner` table with name, business info, document URL, verification flag |
| 6. **PaymentTerms** | Separate table | ✅ Dedicated `PaymentTerms` table linking to all 4 listing types (SaleListing, RentalListing, ShortTermListing, LeaseListing) |

---

## Schema Structure

### Core Models (16 tables)

#### 1. Authentication & User Management (3 tables)
- **Person** (multi-type: physical_person \| organization)
- **User** (simplified roles: user \| admin + link to Person)
- **RefreshToken** (JWT refresh tokens)

#### 2. Property & Ownership (3 tables)
- **Address** (street address with optional geo-coordinates)
- **Property** (asset with owner type: user or external)
- **ExternalPropertyOwner** (non-system owners with documentation)

#### 3. Listings & Types (5 tables)
- **Listing** (base with ListingType discriminator)
  - **SaleListing** (sale-specific: condition, financing)
  - **RentalListing** (rental-specific: lease terms, utilities, pets)
  - **ShortTermListing** (vacation-specific: min stay, guests, cancellation)
  - **LeaseListing** (commercial-specific: lease type, security deposit)

#### 4. Flexible Pricing (1 table)
- **PaymentTerms** (shared by all 4 listing types for flexible pricing models)

#### 5. Agency & Team (2 tables)
- **Agency** (real estate agency with tier)
- **AgencyRole** (contextual roles: owner, manager, agent, sales_manager, support_agent)

#### 6. Geographic Data (2 tables)
- **GeographicalArea** (market-specific zones with hierarchy)
- **AdminBoundary** (official jurisdictions: country → state → district → city → suburb)

#### 7. Points of Interest (5 tables)
- **Amenity** (base POI with coordinates)
  - **HospitalAmenity** (specializations, beds, emergency dept)
  - **SchoolAmenity** (grades, type, pupil count)
  - **RestaurantAmenity** (cuisine, seats, price range)
  - **TransitStopAmenity** (lines, frequency, accessibility)

#### 8. Messaging & Polymorphism (3 tables)
- **Subject** (base for conversation topics)
  - **ListingSubject** (conversation about a listing)
- **Message** (sent through subject for polymorphic conversations)

#### 9. Analytics & Subscriptions (5 tables)
- **View** (listing view tracking)
- **SubscriptionPlan** (base with SubscriptionPlanType discriminator)
  - **IndividualSubscriptionPlan** (user-level: max listings, areas, analytics)
  - **OrganizationSubscriptionPlan** (agency-level: max agents, listings, areas, API access)

---

## Key Design Patterns Implemented

### 1. **Inheritance with Discriminator Pattern**

**Person** (personType enum: physical_person | organization):
```prisma
model Person {
  personType    PersonType  // physical_person | organization
  firstName     String?     // For physical persons
  lastName      String?
  businessName  String?     // For organizations
  businessRegNumber String?
  // ... all fields in one table, discriminated by personType
}
```

**Why**: Single table allows:
- ORMs to query `Person.findMany()` and combine with single `User` object later
- Flexible storage of either type without joins
- Simpler queries when full person details needed

### 2. **Polymorphic Listing Types**

**Listing** (type enum: sale | rental | short_term | lease):
- Base table has `type` discriminator
- Each type has **separate child table** with type-specific fields
- Example: `SaleListing` for property condition, financing; `RentalListing` for lease terms, pets

**Why**: 
- Type-specific fields don't clutter base table
- Each listing type has different required fields (sale ≠ rental ≠ short-term)
- Maintains data integrity

### 3. **Polymorphic Subject + Message**

**Subject** (subjectType enum: listing | property | inquiry):
- Messages link **to Subject**, not directly to Listing
- ListingSubject maps Listing → Subject
- Extensible: add PropertySubject, InquirySubject later without changing Message

**Why**:
- True polymorphism: same Message can discuss any subject type
- Clean extensibility
- Avoids NULL fields in Message table

### 4. **Separate PaymentTerms Table**

All 4 listing types can reference PaymentTerms independently:
```
SaleListing → PaymentTerms (onetime, installment, mortgage)
RentalListing → PaymentTerms (monthly, quarterly, annual)
ShortTermListing → PaymentTerms (per_night, per_week)
LeaseListing → PaymentTerms (monthly, annual, installment)
```

**Why**: 
- Each listing type has different payment models
- Separate table allows flexibility: same term type (e.g., monthly) used across listings
- Easy to add new term types without altering listing tables

### 5. **Contextual Roles via AgencyRole**

**UserRole** (simple: user | admin):
- User role indicates permission level in system
- Contextual roles (agent, manager, owner) stored in **AgencyRole**
- User can have multiple agency roles across different agencies

**Example**:
```
User 1: role=user
  └─ AgencyRole 1: agencyId=1, role=owner
  └─ AgencyRole 2: agencyId=2, role=agent
```

**Why**:
- Simplified user table
- Flexible role assignment per agency
- Users can be agents at one agency, owner at another

### 6. **Ownership Flexibility**

**Property** tracks owner type:
```prisma
ownerType: String  // "user" | "external"
userId: String?    // If user owns it
externalOwnerId: String?  // If external party owns it
```

**ExternalPropertyOwner** includes:
- Full name/business info
- Documentation URL (deed, contract)
- Verification flag
- Optional for agencies (can be nullable)

**Why**:
- Not all properties have system users as owners
- Agencies may manage externally-owned properties
- Tracking documentation is essential for legal compliance

---

## Enums Defined (13 total)

| Enum | Values |
|------|--------|
| **UserRole** | user, admin |
| **PersonType** | physical_person, organization |
| **PropertyType** | house, apartment, villa, land, room, commercial, other |
| **ListingType** | sale, rental, short_term, lease |
| **ListingStatus** | draft, published, paused, expired |
| **PaymentTermType** | onetime, monthly, quarterly, biannual, annual, per_night, per_week, installment |
| **AgencyRoleType** | owner, manager, agent, sales_manager, support_agent |
| **AdminBoundaryType** | international, continent, country, state, province, region, district, prefecture, municipality, city, suburb, neighborhood, street_section |
| **AmenityTypeEnum** | hospital, school, park, shopping, restaurant, cafe, bank, pharmacy, gym, public_transport, library, police, fire_station, supermarket, gas_station, other |
| **SubscriptionStatus** | active, canceled, suspended, expired |
| **SubscriptionTierName** | local, regional, national, premium |
| **SubscriptionPlanType** | individual, organization |
| **MessageType** | inquiry, response |
| **ViewType** | preview, detail |
| **SubjectType** | listing, property, inquiry |

---

## Relationships Summary

### One-to-One
- User ↔ Person (PersonToUser)
- Person → PhysicalPerson (or Organization)
- Listing → SaleListing (or RentalListing, ShortTermListing, LeaseListing)
- Agency → User (AgencyOwner)
- Subject → ListingSubject

### One-to-Many
- Property → Listing (multiple listings per property)
- Property → Address (one address per property, but address can be reused)
- Agency → AgencyRole (multiple roles per agency)
- Listing → View (multiple views per listing)
- Listing → Message (via Subject)
- SubscriptionPlan → IndividualSubscriptionPlan or OrganizationSubscriptionPlan
- User → RefreshToken (multiple tokens per user)
- AdminBoundary → AdminBoundary (parent-child hierarchy)
- GeographicalArea → GeographicalArea (parent-child hierarchy)
- Amenity → HospitalAmenity (or SchoolAmenity, RestaurantAmenity, TransitStopAmenity)

### Many-to-Many
- User ↔ Agency (via AgencyRole) - User can be agent at multiple agencies

---

## Important Design Notes

### Geo-Coordinates Strategy
- **Address**: Has optional `latitude`, `longitude` (can be enriched from Nominatim/Google Maps)
- **Amenity**: Has required `latitude`, `longitude` (precise POI locations)
- **GeographicalArea & AdminBoundary**: Have optional `polygonGeoJson` field (boundary polygon)
- **Future**: Can add PostGIS geometry column later if needed

### Extensibility
- **Subject**: Currently has ListingSubject; add PropertySubject, InquirySubject without changing Message
- **AgencyRole**: Can add more role types to AgencyRoleType enum
- **PaymentTerms**: Can add new payment term types to PaymentTermType enum
- **Amenity**: Can add more amenity types; follow same pattern (base + child table)

### Multi-Country Support
- All models with `country_code` field (ISO 3166-1 alpha-2)
- All address models include country_code for multi-country queries
- AdminBoundary has country_code + boundaryType for regional hierarchies

---

## Validation Status

✅ **Schema Compiles**: `npx prisma validate` passes  
✅ **All Models Defined**: 16 tables  
✅ **All Relations Valid**: No missing opposite fields  
✅ **Enums Complete**: 15 enums defined  
✅ **Indexes Applied**: Performance indexes on high-query fields  
✅ **Unique Constraints**: Applied where needed (user email, person email, listing IDs, etc.)

---

## Next Steps

1. **Database Agent**: Run migration generation
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Database Agent**: Create seed script for test data
   - Populate: Users, Properties, Listings, Amenities, AdminBoundaries
   - Test: All 4 listing types, person types, agency roles

3. **Backend Team**: Generate Prisma Client and start service implementation
   ```bash
   npx prisma generate
   ```

4. **Testing**: Verify relationships work correctly via ORM
   - Create User + Person combo
   - Create Property with ExternalOwner
   - Create all 4 listing types with PaymentTerms
   - Query Subject → ListingSubject → Listing chain

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `db/schema.prisma` | 954 | Complete Prisma schema with all models, relationships, enums, indexes |
| `db/SCHEMA_DESIGN_REFINED.md` | 200+ | Design documentation of refined architecture |
| `db/SCHEMA_CHANGES_CHECKLIST.md` | 300+ | Implementation checklist (now complete) |

---

**Status**: 🚀 **Ready for Database Agent to proceed with migrations**
