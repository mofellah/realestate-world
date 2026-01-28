# User Stories & Journeys

**Last Updated**: 2026-01-27  
**Status**: Complete, ready for feature breakdown

---

## Actors & Roles

### 1. Searcher (Guest/Registered User)
**Goal**: Find and contact about properties efficiently

**Characteristics**:
- May browse anonymously (no login required)
- Must login/register to send inquiry
- Sees property profile (owner name/rating), not direct contact info
- Receives messages via email and in-app inbox
- Can save favorites (Phase 2+)
- Can set alerts (Phase 2+)

**Value Proposition**: Free, powerful property discovery with proximity and amenity filters

---

### 2. Property Owner (P2P Lister)
**Goal**: Monetize property by listing directly to searchers

**Characteristics**:
- Creates Asset (property definition) once
- Creates multiple Listings on asset (sale, rent, airbnb, lease over time)
- Pays per-listing (€20–50) or via subscription (credit-based)
- Controls listing visibility (can pause/disable)
- Receives inquiries from searchers
- Can rent/renovate → disable asset → re-enable later
- Views analytics (views, inquiries, renewal deadlines)

**Value Proposition**: Direct access to buyers/renters, flexible pricing, easy publishing

---

### 3. Agent (Agency Employee)
**Goal**: List properties on behalf of agency, respond to leads

**Characteristics**:
- Employed by agency
- Creates Assets and Listings (workflow same as owner)
- Limited to agency's geographic areas
- Listings covered by agency subscription (no individual payment)
- Inquiries routed to agency inbox (distribution list)
- Collaborates with other agents on same listing
- Can perform role-specific actions (create listing, schedule visits, respond to inquiries)

**Value Proposition**: Efficient lead management, agency branding, team collaboration

---

### 4. Agency (Organization)
**Goal**: Manage agents, geographic territory, and listing portfolio

**Characteristics**:
- Buys subscription (geographic area + concurrent listing allowance)
- Can create multiple agent accounts (tier-dependent)
- Pays for listing overages if needed
- Manages agency profile, branding, reputation
- Views portfolio analytics and performance
- Can upgrade subscription to expand territory/agents

**Value Proposition**: Centralized team management, market dominance in chosen areas

---

### 5. Professional Investor (Premium Tier)
**Goal**: Access exceptional investment properties with advanced tools

**Characteristics**:
- Pays for premium investor tier subscription
- Access to whitelist (curated exceptional properties)
- Can use complex alerts and AI analysis
- May bulk export data for analysis
- Receives recommendations from platform
- Direct access to curated agencies

**Value Proposition**: Deal flow, data-driven decisions, access to rare properties

---

## User Stories (By Priority)

### MVP (Phase 1) Stories

#### SEARCHER STORIES

**US-S1: Browse Properties on Map (Searcher)**
```gherkin
As a searcher
I want to view properties on an interactive map
So that I can discover what's available in my area

Acceptance Criteria:
- Map loads with default view (country/region)
- I can pan and zoom the map
- I see property markers (color-coded by contract type: sale/rent/airbnb)
- Marker clusters when 50+ properties visible
- Clicking marker shows preview card (price, type, bedrooms, address)
- Preview card has "View Details" link
- No login required for browsing
```

**US-S2: Filter Properties by Criteria (Searcher)**
```gherkin
As a searcher
I want to filter properties by price, type, bedrooms, location
So that I can narrow down options to my preferences

Acceptance Criteria:
- Filter panel (left side or drawer) with:
  - Price range slider (min/max)
  - Property type checkboxes (house, apartment, villa, land, room, etc.)
  - Contract type checkboxes (sale, rent long-term, airbnb, lease)
  - Location selector (country, region, city, neighborhood)
  - Amenities checkboxes (optional MVP: garden, garage, balcony)
  - Submit/Apply button
- Filters update map markers in real-time or on Apply
- URL updates with filter params (sharable links)
- Clear filters button
```

**US-S3: Proximity & Amenity Search (Searcher)**
```gherkin
As a parent searcher
I want to find rentals within walking distance of a primary school with good ratings
So that my children have convenient access to education

Acceptance Criteria:
- Amenity types available: Schools, transit stops, hospitals, parks, shopping, restaurants, etc.
- Distance options: 500m, 1km, 2km, 5km, 10km
- Distance metric options: Walking, driving, bird-flight
- Can filter: "Primary schools within 1km + rating >4"
- Can add multiple amenity filters: "Near school + near grocery + near park"
- Filtered results update on map immediately
- Amenity locations visualized on map (optional icons)
```

**US-S4: View Property Details (Searcher)**
```gherkin
As a searcher
I want to see full property details (photos, description, price, terms)
So that I can make an informed decision

Acceptance Criteria:
- Detail page shows:
  - Photo gallery (carousel or grid)
  - Property name and address
  - Price and contract terms
  - Property type, bedrooms, bathrooms, surface area, garden size, etc.
  - Detailed description from owner/agent
  - Owner/agent profile (name, rating, response time)
  - Available amenities list
  - Location on map (zoomed to property)
  - View count (# of people who viewed this property)
- Photos load progressively
- Can favorite property (Phase 2, requires login)
- Can set alert (Phase 2, requires login)
```

**US-S5: Contact Property Owner/Agency (Searcher)**
```gherkin
As a searcher
I want to send an inquiry to the owner/agency about the property
So that I can express interest and schedule a visit

Acceptance Criteria:
- "Contact" button/link on detail page
- If logged out: Redirect to login/register
- If logged in: Show message form (message body only, no email field)
- Message form pre-fills my profile info
- Owner/agent sees my profile (name, rating), NOT my email
- Submit sends message to:
  - Owner email (for P2P listings)
  - Agency email (for agency listings) routed to distribution list
  - In-app inbox for both parties
- Confirmation: "Your message has been sent"
- Searcher can view conversation thread in inbox
```

**US-S6: View Message Inbox (Searcher)**
```gherkin
As a searcher
I want to see all conversations with property owners/agencies
So that I can track follow-ups

Acceptance Criteria:
- In-app inbox lists all conversations (threads)
- Each thread shows:
  - Property name and thumbnail
  - Owner/agency name
  - Last message preview
  - Unread indicator
  - Timestamp of last message
- Click thread to open conversation
- Read full message history
- Can reply to thread
- Receive email/in-app notification for new messages
```

---

#### OWNER (P2P) STORIES

**US-O1: Create Asset (Property) (Owner)**
```gherkin
As an owner
I want to create a property profile with address, description, photos
So that I can list it on the platform

Acceptance Criteria:
- Asset creation form (multi-step or single form):
  - Property type (house, apartment, villa, land, room, etc.)
  - Address (street, city, postal code, country)
  - Photos (upload 5-20 photos, drag to reorder)
  - Description (text, 100-2000 characters)
  - Bedrooms, bathrooms, surface area, garden size, year built, etc.
  - Amenities (pool, garage, garden, balcony, furnished, etc.)
- Required fields: Address, type, at least 3 photos, description
- Photos validated (format, size <5MB each)
- Save as draft (asset created, not visible)
- Can edit asset anytime
- Asset appears in "My Assets" dashboard
```

**US-O2: Create Listing on Asset (Owner)**
```gherkin
As an owner
I want to create a listing (sale, rent, airbnb, lease) for my property
So that I can specify contract terms and pricing

Acceptance Criteria:
- List creation form (asset already selected):
  - Contract type selector (sale, rent long-term, airbnb, lease)
  - Price (sale price, monthly rent, nightly rate)
  - Duration (available from/to dates)
  - Lease/rental terms if applicable (6-month min, utilities incl, etc.)
  - Listing description (optional, property-level description used by default)
- Required fields: Contract type, price, dates
- Can create multiple listings on same asset (sequential rentals)
- Can create multiple contract types (e.g., sale + concurrent rent)
- Save as draft or publish
- Draft appears in "My Listings" with "Publish" button
```

**US-O3: Publish Listing (Owner)**
```gherkin
As an owner
I want to publish my listing and pay for visibility
So that my property appears on the map and gets inquiries

Acceptance Criteria:
- Publish flow:
  1. Validate listing (required fields complete)
  2. Choose payment option:
     - Option A: Pay per listing (30 days €20, 90 days €50, custom duration)
     - Option B: Use subscription credits (1 credit = visibility for selected duration)
  3. If per-listing: Stripe payment, listing goes live immediately after payment
  4. If subscription: Deduct 1 credit, listing goes live immediately
- Listing appears on map within 5 minutes
- Owner receives confirmation email
- Listing shows remaining visibility duration in owner dashboard
- Set auto-renewal (optional, for per-listing payment)
```

**US-O4: View Owner Dashboard (Owner)**
```gherkin
As an owner
I want a dashboard showing my assets, listings, and visibility status
So that I can manage my portfolio and renewals

Acceptance Criteria:
- Dashboard shows:
  - My Assets (list, with photo thumbnail, # of listings per asset, status)
  - My Listings (table: property, contract type, price, visibility duration, status, actions)
  - Visibility status (active, expiring soon, expired)
  - View count per listing (# of unique views in last 7/30 days)
  - Inquiry count per listing (# of messages received)
  - Renewal deadline alerts (bold red text for listings expiring <7 days)
  - Quick actions: "Renew" button for expiring listings, "Edit", "Disable", "Delete"
- Filter by status (active, expiring, expired, draft)
- Can bulk-renew multiple listings
```

**US-O5: Renew Listing (Owner)**
```gherkin
As an owner
I want to renew a listing before it expires
So that it remains visible on the map

Acceptance Criteria:
- From dashboard or listing detail, click "Renew"
- Renewal form:
  - Current duration options (30/90/custom days)
  - Select duration
  - Select payment (per-listing or credit)
- If auto-renewal enabled: Automatic charging before expiry
- Manual renewal: Charge card/deduct credit
- Confirmation email sent
- Visibility reset to selected duration
- Renewal history visible in listing detail
```

**US-O6: Manage Asset Availability (Owner)**
```gherkin
As an owner
I want to mark my asset as unavailable (rented, renovation)
So that all related listings are hidden until it's available again

Acceptance Criteria:
- Asset detail page has "Status" selector (Available, Unavailable)
- When set to Unavailable:
  - All related listings hidden from map
  - Searchers see 404 if they try to access listing detail
  - Owner can still see listings (filtered by status)
- Reason dropdown: Rented, Renovation, Sold, Other (optional)
- When set to Available:
  - Owner can choose to:
    - Re-publish existing listings (with renewal cost if expired)
    - Archive old listings and create new ones
  - Owner receives reminder/option to re-publish
- Can manage availability from dashboard
```

---

#### AGENT / AGENCY STORIES

**US-A1: Agency Creates Account & Buys Subscription (Agency)**
```gherkin
As an agency
I want to create an account and subscribe to a geographic territory
So that my agents can start listing properties

Acceptance Criteria:
- Agency signup form:
  - Agency name, email, phone
  - Country of operation
  - Tier selection (Local/Regional/National with pricing)
  - Geographic area(s) selection (city, region, boundaries)
  - Payment method (Stripe)
- After payment, agency account activated immediately
- Agency receives welcome email with team invite link
- Agency can adjust subscription later (upgrade/downgrade)
- Subscription renews monthly on due date
- Billing invoice emailed before payment
```

**US-A2: Agency Manages Agents (Agency)**
```gherkin
As an agency
I want to create agent accounts and manage permissions
So that my team can list properties and respond to inquiries

Acceptance Criteria:
- Agency dashboard has "Team" section
- "Invite Agent" button generates invite link
- Agent signup form:
  - Name, email (email becomes username)
  - Role (Lister, Visitor, Responder, or All permissions)
  - Assigned to specific geographic area (inherited from agency)
- Agent count limited by subscription tier (5 for Tier Local, 15 for Tier Regional, unlimited for Tier National)
- Can view all agents with status (active, inactive, last login)
- Can disable/remove agent
- Can bulk import agents (CSV upload, Phase 2)
- Default: All agents inherit agency's areas and all permissions
```

**US-A3: Agent Creates Listing (Agent)**
```gherkin
As an agent
I want to create and publish listings for my agency
So that properties get inquiries

Acceptance Criteria:
- Agent workflow same as owner (create asset, create listing)
- Listing shows agency branding (agency logo, name)
- Listing accessible on map immediately (no per-listing payment, covered by agency subscription)
- Listing counts against agency's concurrent listing allowance
- If agency exceeds allowance: Can pay per-listing overage (€5/listing/month) or upgrade subscription
- Agent can see only listings in agency's assigned areas
- Agent can view all agency listings in portfolio (not just own)
```

**US-A4: Agency Dashboard & Analytics (Agency)**
```gherkin
As an agency
I want a dashboard showing all agents, listings, and performance metrics
So that I can manage the business effectively

Acceptance Criteria:
- Dashboard sections:
  - Team: List of agents (name, status, # listings created, last active)
  - Portfolio: All listings (property, agent, status, views, inquiries, renewal date)
  - Geographic Coverage: # listings per area (heatmap optional)
  - Inquiries: Incoming messages (volume per day, response time metrics)
  - Analytics: Views per listing, inquiry source, conversion (msg→visit→deal)
  - Billing: Subscription tier, agents count, listing usage, renewal date
- Filters: By agent, by area, by contract type, date range
- Export reports: CSV (Phase 2)
- Alerts: Listings expiring soon, exceeding listing allowance
```

---

#### CONTACT WORKFLOW STORIES

**US-C1: Searcher Sends Inquiry to Owner (P2P) (Contact)**
```gherkin
As a searcher
I want to send a message directly to the owner
So that I can ask questions or express interest

Acceptance Criteria:
- On listing detail page, "Contact Owner" button
- If not logged in: Redirect to login/register
- If logged in: Show message form with:
  - Message text area (required)
  - Pre-filled: My name, rating (read-only)
  - Submit button
- NO email field (owner doesn't see searcher's email)
- Submit routes message to:
  - Owner's email (pre-configured in listing or account)
  - Owner's in-app inbox (new thread)
- Confirmation: "Your message has been sent to [Owner Name]"
- Searcher can see thread in inbox
```

**US-C2: Searcher Sends Inquiry to Agency (Contact)**
```gherkin
As a searcher
I want to contact the agency about a property
So that an agent can help me find what I need

Acceptance Criteria:
- On agency listing detail, "Contact Agency" button
- If not logged in: Redirect to login/register
- If logged in: Show message form (same as owner flow)
- Submit routes message to:
  - Agency's configured email (or "all_members" distribution list)
  - All agency members see new thread in inbox
  - All agency members can read and respond
  - First responder's name appears in thread (or all contributors)
- Confirmation: "Your message has been sent to [Agency Name]"
- Searcher sees responses from any agency member
```

**US-C3: Owner/Agency Responds to Inquiry (Contact)**
```gherkin
As an owner/agency
I want to respond to searcher inquiries
So that I can follow up and arrange viewings

Acceptance Criteria:
- Inbox shows list of conversations (threads)
- Click thread to open conversation
- Can read full message history
- Reply form at bottom:
  - Text area (required)
  - Submit button
- Reply options:
  - Send via email (optional, automatic)
  - Send via in-app only
- Owner/agency can see all messages from thread
- Searcher receives notification (email/in-app)
- Conversation marked as "responded" (agency can see response time metric)
```

---

### Phase 2+ Stories (Deferred)

**US-W1: Whitelist Access (Investor)**
```gherkin
As an investor
I want exclusive access to exceptional certified properties
So that I can find rare investment opportunities

Acceptance Criteria:
[Deferred - see Phase 2 specs]
```

**US-A5: Complex Alerts (Searcher/Investor)**
```gherkin
As a user
I want to set alerts for properties matching complex criteria
So that I can be notified of opportunities automatically

Acceptance Criteria:
[Deferred - see Phase 2 specs]
```

**US-AI1: AI Assistant Analysis (Investor)**
```gherkin
As an investor
I want AI to analyze properties for ROI and investment potential
So that I can make data-driven decisions

Acceptance Criteria:
[Deferred - see Phase 2 specs]
```

---

## User Journey Maps

### Searcher Journey (Happy Path)
```
1. Open app
2. See map with default view (Belgium)
   ↓
3. Enter filters (price €200-300k, 2BR apartments, within 1km of school with rating >4)
   ↓
4. See filtered properties as map markers
   ↓
5. Click marker → preview card (price, beds, location)
   ↓
6. Click "View Details" → full property page (photos, description, owner profile)
   ↓
7. Click "Contact" → login/register → message form
   ↓
8. Submit message
   ↓
9. Receive email from owner: "Thanks for your interest, happy to arrange a viewing"
   ↓
10. Click email link → in-app inbox → view conversation
   ↓
11. Schedule viewing through back-and-forth messaging
   ↓
12. Visit property → make decision
```

### Owner Journey (Happy Path)
```
1. Create account
   ↓
2. Create Asset (Villa in Brussels, 4BR, garden, photos)
   ↓
3. Create Listing (Rent, €2500/month, 6-month minimum)
   ↓
4. Click "Publish" → choose payment (30 days for €20)
   ↓
5. Complete Stripe payment
   ↓
6. Listing appears on map within 5 min
   ↓
7. View dashboard: 1 listing active, 8 views in first day
   ↓
8. Receive inquiry from Searcher A: "Can we visit this weekend?"
   ↓
9. Respond in-app: "Yes, Sunday 2pm works"
   ↓
10. Searcher books visit, rents property
   ↓
11. After 6 months: Listing near expiry
   ↓
12. Click "Renew" → pay another €20 → listing live again for 30 days
```

### Agency Journey (Happy Path)
```
1. Signup as agency
   ↓
2. Select Tier Regional (3 areas + 100 listings + 15 agents) → €1500/month
   ↓
3. Payment via Stripe
   ↓
4. Account activated, generate agent invite link
   ↓
5. Invite 5 agents (send email with signup link)
   ↓
6. Agents join, create assets and listings
   ↓
7. Listings appear on map (agency branding)
   ↓
8. Inquiries arrive via email and in-app
   ↓
9. Agents respond collaboratively (all see thread, all can respond)
   ↓
10. Track analytics: 200 views, 20 inquiries, 5 viewings scheduled, 2 rentals
   ↓
11. After 3 months: Usage analytics show need for 120 concurrent listings (vs 100 allowed)
   ↓
12. Option A: Pay overage €20/listing/month (for 20 extra) = €400/month
   ↓
13. Option B: Upgrade to Tier National (unlimited listings) = €5000/month
   ↓
14. Decide to pay overage for now, monitor growth
```

---

## Success Criteria

**Searcher**:
- ✅ Can browse map without friction (no login required)
- ✅ Can find properties matching criteria within 30 seconds
- ✅ Can contact owner/agency from any property page
- ✅ Receives response within 4 hours (goal)

**Owner**:
- ✅ Can create asset in <5 minutes
- ✅ Can publish listing in <2 minutes (payment included)
- ✅ Receives first inquiry within 1 hour of publishing
- ✅ Can renew listing with 1 click

**Agency**:
- ✅ Can create team and start listing within 1 hour
- ✅ All agents see inquiries immediately
- ✅ Can track portfolio and performance in real-time
- ✅ Can scale team as needed (add agents per subscription)

---

**Status**: ✅ Complete  
**Ready For**: Feature specifications and acceptance criteria definition
