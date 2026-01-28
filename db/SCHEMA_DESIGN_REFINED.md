# Database Schema Architecture - Refined Design
**Date**: 2026-01-28  
**Status**: Design Review  

## Key Design Changes

### 1. **User Role Simplification**
```
UserRole: user | admin
// Everything else is contextual via relationships:
// - Owner: user with Property ownership
// - Agent: user with Agency employment + agent role in AgencyRole
// - Searcher: default user role
```

### 2. **Person Inheritance (Table-per-type)**
```
Person (base)
  ├─ PhysicalPerson
  │   ├─ firstName, lastName
  │   ├─ idNumber, idType, idVerified
  │   └─ nationality
  │
  └─ Organization
      ├─ businessName
      ├─ businessRegNumber
      ├─ taxId
      └─ registrationCountry
```

### 3. **User/Agency Owner Polymorphism**
```
User.personId → Person (can be PhysicalPerson OR Organization)
Agency.ownerId → User
  // But Agency must track if owner is org or individual
  // AgencyOwnerType: physical_person | organization
```

### 4. **Geographic Objects Consolidation (PostGIS)**
Create **GeoObject** table for all shapes/points:
```
GeoObject
  ├─ type: point | polygon | multipolygon
  ├─ coordinates: geometry (PostGIS)
  ├─ geojson: Json (backup)
  └─ indexed for performance

Then link:
- Address → GeoObject (point for coordinates)
- AdminBoundary → GeoObject (polygon for boundary)
- GeographicalArea → GeoObject (polygon for boundary)
- Amenity → GeoObject (point for location)
```

### 5. **Address Redesign**
```
Address (no coordinates)
  ├─ streetName, streetNumber, unit
  ├─ postalCode, city, region, country_code
  ├─ geoObjectId? (nullable, enriched later from Nominatim)
  └─ metadata (for complex address formats)
```

### 6. **AdminBoundaryType Hierarchy**
```
AdminBoundaryType:
  international
  continent
  country
  state
  province
  region
  district
  prefecture
  municipality
  city
  suburb
  neighborhood
  street_section  // For fine-grained delivery areas
```

### 7. **Listing & Contract Clarity**
```
Listing (base)
  ├─ type: sale | rental | short_term | lease (RENAME to remove ambiguity)
  ├─ createdBy: userId (not "user" - ambiguous)
  ├─ contractTerms: Json (payment terms, duration, etc.)
  │
  ├─ SaleListing
  │   ├─ condition
  │   └─ paymentTerms: onetime | installment
  │
  ├─ RentalListing
  │   ├─ leaseTermMonths
  │   ├─ utilitiesIncluded
  │   └─ paymentTerms: monthly | quarterly | annually
  │
  ├─ ShortTermListing
  │   ├─ minStayNights
  │   └─ paymentTerms: per_night | per_week | per_month
  │
  └─ LeaseListing
      ├─ leaseType
      └─ paymentTerms: monthly | quarterly
```

### 8. **Property Owner Always Tracked**
```
Property
  ├─ primaryOwnerType: user | external (enum)
  ├─ userId? (nullable, if owner is user)
  └─ externalOwner: ExternalProperty Owner (if not in system)
      ├─ name
      ├─ email
      ├─ phone
      └─ country

// If owner is external, still track contact info
```

### 9. **Message Subject Polymorphism**
```
Message
  ├─ senderId (User)
  ├─ recipientId (User)
  ├─ threadId
  ├─ subjectType: property | listing | inquiry | general
  ├─ subjectId (polymorphic FK)
  │
  ├─ PropertyMessage → references Property
  ├─ ListingMessage → references Listing
  ├─ InquiryMessage → references Inquiry (separate table)
  └─ GeneralMessage → no specific subject

// Better: use discriminator pattern
// subjectType: property | listing | inquiry
// propertyId?, listingId?, inquiryId?
```

### 10. **Amenity with Inheritance (Type-specific data)**
```
Amenity (base)
  ├─ name, type
  ├─ geoObjectId (point location)
  ├─ metadata: Json
  │
  ├─ Hospital (amenity_type: hospital)
  │   ├─ specializations: string[]
  │   ├─ beds: int
  │   └─ emergencyDept: boolean
  │
  ├─ School (amenity_type: school)
  │   ├─ grades: int[]
  │   ├─ type: public | private
  │   └─ pupils: int
  │
  ├─ Restaurant (amenity_type: restaurant)
  │   ├─ cuisine: string
  │   ├─ avgRating: float
  │   └─ seatsAvailable: int
  │
  └─ TransitStop (amenity_type: public_transport)
      ├─ lines: string[] (bus routes, metro lines)
      └─ frequency: string (every X minutes)
```

### 11. **Admin Boundary Hierarchy (Fixed)**
Already correct:
```
AdminBoundary
  ├─ parentBoundaryId (hierarchy)
  ├─ boundaryType (country → state → district → municipality → city → suburb → neighborhood)
  ├─ geoObjectId (polygon)
  └─ Example path: EU → France → Île-de-France → Paris → 16ème arr.
```

### 12. **Remove AreaLevel (redundant with AdminBoundary)**
```
DELETE AreaLevel enum
DELETE Area model (or rename to CustomArea if needed for non-official zones)

// Keep only:
- GeographicalArea (market-specific zones like "Coverage Area")
- AdminBoundary (official jurisdictions)
```

---

## Revised Tables Summary

### Core Entities
- **PhysicalPerson** (from Person)
- **Organization** (from Person)
- **User** (references Person polymorphically)
- **Agency** (references User as owner)
- **AgencyRole** (user→agency relationship with role: agent, manager, etc.)

### Geographic
- **GeoObject** (PostGIS point/polygon, indexed)
- **Address** (references GeoObject)
- **AdminBoundary** (references GeoObject)
- **GeographicalArea** (references GeoObject)
- **Amenity** (references GeoObject)

### Property & Listing
- **Property** (owner: user | external)
- **ExternalPropertyOwner** (for non-system owners)
- **Listing** (createdBy: userId)
  - **SaleListing** (with paymentTerms)
  - **RentalListing** (with paymentTerms)
  - **ShortTermListing** (with paymentTerms)
  - **LeaseListing** (with paymentTerms)

### Messaging
- **Message** (subjectType + polymorphic subjectId)
- **MessageThread** (grouped messages)
- **Inquiry** (separate entity for inquiries)

### Subscription
- **SubscriptionPlan**
  - **IndividualSubscriptionPlan**
  - **OrganizationSubscriptionPlan**

### Other
- **View** (listing views)
- **RefreshToken** (auth)

---

## Migration Path

1. Keep current schema as-is
2. Create new schema incrementally
3. Test foreign keys and relationships
4. Validate PostGIS geometry operations
5. Create migrations once finalized

**Ready to implement?** Approve structure changes first.
