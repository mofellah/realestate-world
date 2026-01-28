# Feature Specifications

This directory contains detailed specifications for each core feature. Each feature includes:
- User stories it supports
- Acceptance criteria (testable)
- Edge cases and error handling
- Data requirements
- Dependencies (technical, business, external)
- BDD scenarios (Given/When/Then)

## Core Features (MVP Phase 1)

### 1. Map-Based Search
**File**: `map-search.md`  
**Owner**: Frontend + Backend  
**Status**: Spec ready for implementation

**Features**:
- Interactive map with pan/zoom
- Property markers (color-coded by contract type)
- Marker clustering for dense areas
- Click marker → preview card
- Click "View Details" → full property page
- Filters: price, property type, contract type, location, amenities
- Proximity/amenity filters: distance + type (schools, transit, etc.)

**Success Criteria**:
- Map loads <2s on initial load
- Filter response <500ms
- <30s to find property matching criteria

---

### 2. Property & Listing Management
**File**: `property-listing-management.md`  
**Owner**: Frontend + Backend  
**Status**: Spec ready for implementation

**Features**:
- Owner creates Asset (property definition)
- Owner creates Listing(s) (contract on property)
- Publish listing with payment (per-listing) or subscription (credit)
- Credit system: visibility periods (30/90 days)
- Asset becomes unavailable → hides listings
- Owner dashboard: assets, listings, visibility status
- Renew listing before expiry
- Disable/pause listing anytime

**Success Criteria**:
- Asset creation <5 minutes
- Listing publication <2 minutes (including payment)
- Dashboard loads <2s with 50 listings
- Expiry calculated and hidden correctly

---

### 3. Contact Workflow (Messaging)
**File**: `contact-workflow.md`  
**Owner**: Frontend + Backend  
**Status**: Spec ready for implementation

**Features**:
- Searcher sends inquiry (login required)
- Message routed to owner/agency email + in-app inbox
- Searcher profile visible (not email)
- Agency distribution list: all members see/respond
- Message threading in inbox
- In-app and email notification

**Success Criteria**:
- Message delivery <5 minutes
- All distribution list members notified <10 minutes
- Conversation threading correct (no lost messages)

---

### 4. Agency Management
**File**: `agency-management.md`  
**Owner**: Frontend + Backend  
**Status**: Spec ready for implementation

**Features**:
- Agency creates account + buys subscription (tier)
- Agency selects geographic area(s)
- Agency creates agent accounts (tier-limited)
- Agents inherit area restrictions
- Agency dashboard: agents, listings, portfolio, analytics
- Subscription management (upgrade/downgrade, renewal)

**Success Criteria**:
- Agency signup <10 minutes
- Agent team creation <5 minutes per agent
- Dashboard loads <2s with 100 listings
- Subscription billing working correctly

---

### 5. Views Tracking
**File**: `views-tracking.md`  
**Owner**: Backend  
**Status**: Spec ready for implementation

**Features**:
- Track unique views (preview card clicks)
- Track unique views (listing detail page)
- Separate metrics per listing, area, agency
- Use accepted unique visitor practices (not user-specific)

**Success Criteria**:
- View counting accurate (no double-counting)
- Metrics updated within 5 minutes
- Performance impact <10ms per request

---

## Phase 2 Features (Deferred)

### 6. Whitelist & Premium Listings
**File**: `whitelist.md`  
**Status**: Design ready, deferred to Phase 2

---

### 7. Complex Alerts & Analytics
**File**: `alerts-analytics.md`  
**Status**: Design ready, deferred to Phase 2

---

### 8. AI Assistant
**File**: `ai-assistant.md`  
**Status**: Design ready, deferred to Phase 2

---

## How to Use This Section

**For Developers**:
1. Read the PRODUCT_VISION.md for context
2. Read USER_STORIES.md for user needs
3. Read the feature spec file for detailed requirements
4. Read the BDD scenario file for testable acceptance criteria

**For QA/Test**:
1. Review acceptance criteria
2. Review BDD scenarios (Given/When/Then)
3. Create test cases mapping to scenarios
4. Verify edge cases and error handling

**For Product**:
1. Use specs to communicate with stakeholders
2. Update specs when requirements change
3. Link specs to implementation PRs
4. Track feature completion against acceptance criteria

---

**Status**: MVP specs complete, ready for Database design and Test planning
