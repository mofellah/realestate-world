# Database Agent Task - Schema Validation & Design Review

**Status**: 🔴 URGENT - Blocking Phase 3 completion  
**Assigned To**: Database Agent  
**Priority**: P0 (Coder agent blocked, Listing service cannot proceed)  
**Issue**: Phase 3 Blocker - Pre-existing schema mismatches

---

## Context

Coder agent completed Properties service (18/18 tests ✅), but identified **schema mismatches** blocking:
1. ❌ Listing service implementation
2. ❌ Users service tests (7/13 failing)
3. ❌ Auth register tests (3/9 failing)

See: `.github/PHASE3_CODER_REPORT.md`

---

## What You Must Validate

Review `db/schema.prisma` against test expectations in failing tests and make final architectural decisions.

---

## ❓ Schema Issue 1: User `name` Field

**Test File**: `apps/backend/src/auth/__tests__/auth.register.spec.ts`

**Conflict**:
```typescript
// Line 95 (expects name to exist)
expect(result.user.name).toBe(registerRequest.name);

// Line 259 (expects name to be nullable)
expect(result.user.name).toBeNull();
```

**Decision Required**:
- [ ] Is `name` **REQUIRED or OPTIONAL** in User model?
- [ ] If optional: which test is wrong? (delete it)
- [ ] If required: does schema enforce non-null?

**Action**:
1. Decide: required or optional?
2. Update `db/schema.prisma` User model
3. Add comment explaining decision
4. Document in this file under "Decisions Made"

---

## ❓ Schema Issue 2: User `role` vs `userRoles` Relationship

**Test File**: `apps/backend/src/users/__tests__/users.service.spec.ts`

**Current Conflict**:
- Test expects: `userRoles: { create: { roleId } }` (proper RBAC relationship)
- Actual schema: `role: String` field (simple role field)

**Current Schema Has Both Options** - pick ONE:

### Option A: Simple Role String
```prisma
model User {
  // ...
  role String @default("user") // "user", "admin", "agent"
}
```
- ✅ Simpler queries
- ✅ Faster role checks
- ❌ No advanced RBAC support
- ❌ Tests must change

### Option B: RBAC with userRoles Relationship
```prisma
model User {
  // ...
  userRoles UserRole[] // Many-to-many with Role
}

model UserRole {
  userId String
  roleId String
  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])
}
```
- ✅ Proper RBAC design
- ✅ Tests are correct
- ✅ Support permissions per role
- ❌ More complex queries

**Decision Required**:
- [ ] Choose Option A (simple) or Option B (RBAC)?
- [ ] Update schema to match choice
- [ ] Document decision with rationale

**Action**:
1. Decide: simple role or RBAC userRoles?
2. Update `db/schema.prisma` User + Role models
3. If RBAC: confirm UserRole join table structure
4. Add comment explaining decision

---

## ❓ Schema Issue 3: Listing Type & Address Relationships

**Problem**: Coder agent cannot implement ListingService until Listing design is confirmed.

**Decisions Needed**:

### 3a. ListingType Enum
What are the valid property types?
```prisma
enum ListingType {
  RESIDENTIAL     // House, apartment, condo
  COMMERCIAL      // Office, retail, industrial
  LAND            // Vacant land, development sites
  MIXED_USE       // Combined residential + commercial
}
```

- [ ] Are these the right types?
- [ ] Any missing (e.g., parking, storage)?
- [ ] Confirm values in schema

### 3b. Address Relationship
How does Listing reference Address?

**Option A**: Direct relationship
```prisma
model Listing {
  address Address @relation(fields: [addressId], references: [id])
  addressId String
}
```

**Option B**: Embedded address data
```prisma
model Listing {
  street String
  city String
  zipCode String
  country String
}
```

- [ ] Does Property also reference Address?
- [ ] Can multiple listings share one address?
- [ ] Property-to-Listing: 1-many or many-many?

### 3c. Required Fields
Which Listing fields are REQUIRED?
- [ ] title? (yes, always)
- [ ] description? (optional for draft)
- [ ] pricePerMonth? (optional until published)
- [ ] availableFrom? (when does tenant move in)
- [ ] paymentTerms? (required or optional)

**Action**:
1. Confirm ListingType enum values
2. Decide: Direct Address ref or embedded fields?
3. Confirm Property-Listing relationship (1-many)
4. Document required vs optional fields
5. Add comments to schema.prisma

---

## Your Deliverables

### 1. Updated `db/schema.prisma`

Must document:
```prisma
// USER MODEL DECISION:
// - name is [REQUIRED / OPTIONAL] because [reason]
// - role uses [SIMPLE STRING / RBAC userRoles] pattern

model User {
  // ... updated fields based on decision
}

// LISTING MODEL DECISION:
// - ListingType enum: [list all values]
// - Address: [REFERENCE / EMBEDDED]
// - Property-to-Listing: 1-many (each property has many listings)

enum ListingType {
  // ... confirmed values
}

model Listing {
  // ... confirmed fields
}
```

### 2. Decisions Made (Document Below)

Fill in this section with your architectural decisions:

---

## ✅ Decisions Made

**Database Agent Decision Log** (filled in after schema review):

### Decision 1: User `name` Field
- [x] Status: OPTIONAL
- [ ] Status: REQUIRED
- **Rationale**: Real estate systems benefit from flexible user onboarding. Users can register quickly with just email/password, then complete their profile later by linking to Person/PhysicalPerson models. This supports:
  - Quick registration flow (email + password only)
  - Progressive profile completion
  - External property owners who don't need full profiles
  - Test scenarios where name may be null (line 259 is VALID)
- **Schema Change**: Added `name String?` to User model with documentation
- **Tests affected**: 
  - `auth.register.spec.ts` line 95: ✅ VALID (expects name when provided)
  - `auth.register.spec.ts` line 259: ✅ VALID (expects null when not provided)
  - Both tests are correct and should pass

### Decision 2: User Role Pattern
- [x] Status: Simple `role: UserRole` enum field (user/admin)
- [ ] Status: RBAC with `userRoles[]` relationship
- **Rationale**: After analyzing schema, the current design is SUPERIOR:
  - System uses `UserRole` enum (user/admin) for platform-level permissions
  - Fine-grained permissions handled via `AgencyRole` model (owner/manager/agent/sales_manager/support_agent)
  - AgencyRole provides RBAC *within agency context* without complicating user queries
  - This hybrid approach: simple at user level, complex at agency level
  - Faster queries: `WHERE role = 'admin'` vs JOIN through userRoles table
- **Schema Status**: Already correct - NO CHANGES NEEDED
- **Tests affected**: 
  - `users.service.spec.ts`: Tests expecting `userRoles` are **INCORRECT**
  - Tests should query `agencyRoles` if testing agency permissions
  - Tests should use `user.role` for system-level permissions
  - **Action Required**: Coder/Test agent must update tests to match schema

### Decision 3: Listing Address
- [x] Status: Address REFERENCED via Property model (indirect)
- [ ] Status: Direct `Address` reference
- [ ] Status: Embedded fields (street, city, etc)
- **Rationale**: Current schema uses optimal pattern:
  - Listing → Property → Address (two-hop relationship)
  - Property has `addressId` (one Address per Property)
  - Listing has `propertyId` (one Property per Listing, but many Listings per Property)
  - This allows: Same property listed for sale AND rent simultaneously
  - Address normalization: No duplicate addresses in database
- **Schema Status**: Already correct - NO CHANGES NEEDED
- **Required fields confirmed**:
  - `propertyId`: REQUIRED (FK to Property)
  - `createdBy`: REQUIRED (audit trail)
  - `type`: REQUIRED (sale/rental/short_term/lease discriminator)
  - `status`: REQUIRED (draft/published/paused/expired)
  - `paymentTermsId`: REQUIRED (pricing structure)
  - `visibilityStart/End`: OPTIONAL (scheduled publishing)
  - `publishedAt`: OPTIONAL (set when published)

### Decision 4: ListingType Values
- [x] Confirmed types: sale, rental, short_term, lease
- **Rationale**: 
  - `sale`: One-time property purchases (residential/commercial)
  - `rental`: Long-term residential rentals (6+ months lease)
  - `short_term`: Vacation/AirBnB-style short stays (days/weeks)
  - `lease`: Commercial/industrial long-term leases (multi-year)
  - Each type has dedicated child table with type-specific fields:
    - SaleListing (condition)
    - RentalListing (deposit, utilities, pets, furnishing)
    - ShortTermListing (min stay nights, cancellation, check-in/out)
    - LeaseListing (lease term years, renewal, commercial use)
- **Schema Status**: Already correct - NO CHANGES NEEDED

---

### Summary of Changes Made

**Files Modified**:
1. `db/schema.prisma`:
   - Added `name String?` to User model (line ~263)
   - Added comprehensive documentation comments for User model (lines 245-260)
   - Added comprehensive documentation comments for Listing model (lines 499-529)
   - Explained ListingType enum values
   - Documented Address relationship pattern
   - Documented required vs optional fields

**No Migration Required**: 
- Adding `name String?` (nullable) requires migration: `npx prisma migrate dev --name add_user_name_field`
- But schema was already mostly correct

**Tests Requiring Updates** (Coder/Test Agent Action Items):
1. `apps/backend/src/users/__tests__/users.service.spec.ts`:
   - Remove expectations of `userRoles` relationship
   - Update to test `user.role` enum instead
   - If testing agency permissions, query `agencyRoles` instead
   
2. `apps/backend/src/auth/__tests__/auth.register.spec.ts`:
   - Tests are CORRECT as-is (both line 95 and 259 are valid)
   - Will pass once User.name field is added via migration

---

## Exit Criteria (Status = ✅ Complete)

Database agent work is done when:
- ✅ Schema decisions documented in schema.prisma comments
- ✅ All conflicts resolved (filed issues, not left ambiguous)
- ✅ Coder agent can read decisions and understand design intent
- ✅ Test file updated to match schema (or tests deleted if wrong)
- ✅ Completion report appended to `.github/AGENT_WORK_LOG.md`

---

## What Happens After You Complete

1. **Coder Agent**: Implements ListingService (20+ test cases)
2. **Test Agent**: Fixes pre-existing test failures  
3. **All Tests**: Target 120/120 passing
4. **Timeline**: Phase 3 complete, Phase 4 (Integration) begins

---

## Related Files

- Current Schema: `db/schema.prisma`
- Failing Tests: 
  - `apps/backend/src/auth/__tests__/auth.register.spec.ts`
  - `apps/backend/src/users/__tests__/users.service.spec.ts`
- Coder Report: `.github/PHASE3_CODER_REPORT.md`
- Work Log: `.github/AGENT_WORK_LOG.md`

---

## Status Tracking

**Current Phase**: Phase 3 (Backend Services)  
**Orchestrator**: Waiting on Database Agent signature  
**Coder Agent**: Blocked (waiting for schema validation)  
**Timeline**: Due ASAP (critical path)  

When done, append to `.github/AGENT_WORK_LOG.md`:
```markdown
## Phase 3b - Database Agent Schema Validation Report

**Status**: ✅ Complete
**Timestamp**: [ISO date UTC]
**Agent**: Database Agent
**Task**: Schema validation and design decisions

### Decisions Made
- [Decision 1]: [outcome]
- [Decision 2]: [outcome]
- ...

### Schema Updated
- [Files modified]

### Tests Affected
- [List test files that need updates]

### Next Step
- Coder agent may now proceed with ListingService
```
