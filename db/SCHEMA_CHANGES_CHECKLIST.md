# Schema Changes Checklist

## Critical Changes

### ✅ Enums
- [ ] Remove `AreaLevel` (redundant with AdminBoundary hierarchy)
- [ ] Update `UserRole` to only: `user`, `admin` 
  - Everything else is contextual (role via Agency, message type via relationship, etc.)
- [ ] Rename `ListingType` to be clearer OR remove `ContractType` 
  - **Decision needed**: Use one of:
    - Option A: Keep only `ListingType` (sale|rental|short_term|lease)
    - Option B: Keep `ContractType` and remove `ListingType`
    - Recommended: Option A (ListingType is clearer)
- [ ] Add `PaymentTerms` enum: `onetime | monthly | quarterly | biannual | annual`
- [ ] Expand `AdminBoundaryType`: add `international`, `continent`, `prefecture`, `street_section`
- [ ] Create `PersonType` enum: `physical_person | organization`
- [ ] Create `PropertyOwnerType` enum: `user | external`
- [ ] Create `AmenityTypeCategory` enum (organize by inheritance)

### ✅ Person Inheritance
Replace single `Person` table with:
```
Person (base with personType discriminator)
  ├─ PhysicalPerson (firstName, lastName, idNumber, nationality)
  └─ Organization (businessName, businessRegNumber, taxId, registrationCountry)
```

### ✅ Geographic Objects (PostGIS)
Create **GeoObject** table:
```
GeoObject
  ├─ type: point | polygon | multipolygon
  ├─ coordinates: geometry (PostGIS native type)
  ├─ geojson: Json (backup/serialization)
  ├─ createdAt, updatedAt
  └─ Indexes: @@index on coordinates (PostGIS spatial index)
```

Then update:
- `Address` → Remove latitude/longitude, add geoObjectId (optional, for Nominatim enrichment)
- `AdminBoundary` → Add geoObjectId (polygon)
- `GeographicalArea` → Add geoObjectId (polygon)
- `Amenity` → Add geoObjectId (point), remove latitude/longitude

### ✅ Address Redesign
```
Address (no coordinates - just identifiers)
  ├─ streetName, streetNumber, unit
  ├─ postalCode, city, region, country_code
  ├─ geoObjectId? (optional, enriched from Nominatim)
  ├─ metadata: Json (for complex formats: "Rue du 1er Septembre", etc.)
  └─ properties: Property[]
```

### ✅ User Updates
- `User.name` → Remove (use `PhysicalPerson.firstName/lastName` via Person table)
- `User.person` → Add relationship to Person (polymorphic)
- `User.roles` → Change from array to **single role**: `user | admin`
- **Contextual roles**:
  - Owner: user with `Property.createdBy = userId`
  - Agent: user with `AgencyRole(role: agent)`
  - Searcher: default user role

### ✅ Agency Updates
- `Agency.owner` → User (unchanged)
- Add `agencyOwnerType`: `physical_person | organization` (track person type for compliance)
- Remove `subscriptionId` (move to OrganizationSubscriptionPlan relationship)
- Create `AgencyRole` table:
  ```
  AgencyRole
    ├─ userId (FK)
    ├─ agencyId (FK)
    ├─ role: manager | agent | sales_manager | etc.
    └─ permissions: Json
  ```

### ✅ Property Updates
- Add `primaryOwnerType`: `user | external`
- Add `userId?` (nullable, if owner is system user)
- Add `externalOwnerId?` (nullable, if owner is external)
- Create `ExternalPropertyOwner` table:
  ```
  ExternalPropertyOwner
    ├─ name
    ├─ email, phone
    ├─ address
    ├─ country_code
    ├─ isPerson: boolean (person vs. company)
    └─ metadata: Json
  ```
- Remove Address fields (streetName, streetNumber, etc.)
- Keep only `addressId: Address` FK

### ✅ Listing Updates
- Rename `userId` → `createdBy` (clearer intent)
- Remove `contractType` (use `type` instead)
- Use only `type: sale | rental | short_term | lease`
- Add `paymentTerms` enum to each child:
  ```
  SaleListing
    ├─ condition
    ├─ paymentTermsType: onetime | installment
    └─ installmentDetails? (if installment)
  
  RentalListing
    ├─ leaseTermMonths
    ├─ paymentTermsType: monthly | quarterly | annually
    └─ autoRenew: boolean
  
  ShortTermListing
    ├─ minStayNights
    ├─ paymentTermsType: per_night | per_week | per_month
    └─ depositRequired: Float?
  
  LeaseListing
    ├─ leaseType
    ├─ paymentTermsType: monthly | quarterly
    └─ renewalTerms: String?
  ```

### ✅ Message Redesign
Replace single `listingId` with polymorphic subject:
```
Message
  ├─ senderId, recipientId, threadId
  ├─ subjectType: property | listing | inquiry | general
  ├─ subjectId: String? (polymorphic FK)
  │   // When subjectType = property → propertyId
  │   // When subjectType = listing → listingId
  │   // When subjectType = inquiry → inquiryId
  │   // When subjectType = general → null
  │
  ├─ propertyId? (FK)
  ├─ listingId? (FK)
  ├─ inquiryId? (FK)
  │
  ├─ subject, body, isRead
  └─ createdAt

// OR separate tables:
PropertyMessage extends Message
ListingMessage extends Message
InquiryMessage extends Message
GeneralMessage extends Message
```

### ✅ Amenity with Type-Specific Data
Create separate tables per type (or use JSONB for metadata):
```
Amenity (base)
  ├─ name, amenityType
  ├─ geoObjectId (point)
  ├─ openingHours, phone, website
  ├─ avgRating?, reviewCount?
  ├─ metadata: Json (for any additional data)
  │
  └─ Child tables (optional, if strict typing needed):
      ├─ HospitalAmenity (specializations, beds, emergency)
      ├─ SchoolAmenity (grades, type, pupils)
      ├─ RestaurantAmenity (cuisine, seats)
      └─ TransitAmenity (lines, frequency)
```

### ✅ Remove Redundancy
- [ ] Delete `Area` model (merge into `AdminBoundary` or `GeographicalArea`)
- [ ] Delete `Subscription` model (use `SubscriptionPlan` polymorphic hierarchy)
- [ ] Delete standalone `AreaLevel` enum

### ✅ Add Missing Tables
- [ ] `GeoObject` (PostGIS geometry storage)
- [ ] `ExternalPropertyOwner` (non-system owners)
- [ ] `AgencyRole` (user→agency relationship)
- [ ] `Inquiry` (separate from Message if needed)
- [ ] `MessageThread` (organize conversations)

---

## Implementation Order

1. **Phase 1**: Person inheritance + User simplification
2. **Phase 2**: GeoObject + Address refactoring
3. **Phase 3**: Property owner polymorphism
4. **Phase 4**: Listing payment terms
5. **Phase 5**: Message subject polymorphism
6. **Phase 6**: Amenity enhancements
7. **Phase 7**: AdminBoundary validation
8. **Phase 8**: Clean up redundancies

---

## Questions for Clarification

1. **Person inheritance**: Use table-per-type (separate tables) or single table with discriminator?
2. **Amenity types**: Separate tables per type or unified with JSONB metadata?
3. **Message subject**: Single polymorphic field or separate tables per subject type?
4. **User roles**: Keep `user | admin` OR add `searcher | owner | agent` as well?
5. **External owners**: How detailed should we track external property owners?
6. **PaymentTerms**: Should this be a separate table or enum + details in JSONB?

**Approve design, then proceed with schema rewrite?**
