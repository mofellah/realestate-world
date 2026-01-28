# Product Vision: Real Estate Platform

**Last Updated**: 2026-01-27  
**Status**: Requirements phase complete, ready for implementation planning  
**Stakeholder Approved**: Yes

---

## Executive Summary

A subscription-based real estate platform enabling property owners, agencies, and agents to list properties with multiple contract types (sale, rent, Airbnb, lease), optimized for **searchers-first** with powerful, intuitive map-based discovery.

**Business Model**: Multi-tiered revenue from property owners (pay-per-listing or subscriptions), agencies (wholesale geographic + listing allowances), and investors (premium features).

**MVP Target**: Belgium, Holland, Switzerland (3-month timeline). France deferred due to large OSM data import.

---

## Vision Statement

**To become the leading map-centric real estate platform in Europe, enabling:**
- **Searchers**: Discover properties with powerful proximity and amenity filters
- **Owners**: List directly (P2P) and monetize unused properties
- **Agencies**: Manage geographic territories and agent teams efficiently
- **Investors**: Access exceptional properties and advanced market analytics

---

## Market & Positioning

### Target Markets (MVP Order)
1. **Belgium** (primary MVP)
2. **Holland** (Netherlands)
3. **Switzerland** (Suisse)

(France deferred: requires extensive OSM + real estate transaction data import)

### Business Models Supported
1. **Particulier à Particulier (P2P)**: Owner → Searcher (direct)
2. **Agency to Particulier (B2C)**: Agency/Agent → Searcher

### Competitive Advantages
- **Searcher-first**: Free, powerful map search (proximity, amenities, filters)
- **Multi-contract**: Sale, rent (short/long), Airbnb, lease (all in one platform)
- **Multi-country**: Subscription and contract types adapt per country
- **Extensible**: Asset hierarchy (property + sub-properties like garages, rooms)
- **Data-rich**: Integration with OSM, real estate transactions, market indicators

---

## Revenue Streams

### 1. Property Owners (P2P)
**Model**: Pay-per-listing or subscription (with credit system)

#### Option A: Pay-Per-Listing
- **Price**: €20–50 depending on market/duration
- **Duration**: 30 days, 90 days, custom
- **Auto-Renewal**: Owner can enable automatic renewal before expiry
- **Billing**: One-time payment at publish time
- **Visibility**: Listing hidden when duration expires (no grace period)

#### Option B: Subscription (with Concurrent Listings)
- **Tier Basic**: 1 concurrent listing → €10/month (credit: visibility for 1 property)
- **Tier Pro**: 5 concurrent listings → €30/month (credit: visibility for 5 properties)
- **Tier Enterprise**: Unlimited concurrent listings → €100/month

**Credit System**:
- Owner purchases credits for visibility periods (30/90/custom days)
- Credits consumed as listing is live
- Supports flexible scaling
- Owner can pause/unpause listing anytime

**Forecast (Year 1)**: 5,000 owners × €30/month avg = €1.8M recurring

---

### 2. Agencies (Wholesale)
**Model**: Geographic territory + concurrent listing allowances (tiered)

#### Subscription Tiers (vary by country)
Example for Belgium (Tier structure TBD):
- **Tier Local**: 1 geographic area + 20 concurrent listings + 5 agents → €500/month
- **Tier Regional**: 3 areas + 100 concurrent listings + 15 agents → €1500/month
- **Tier National**: All areas + unlimited listings + unlimited agents → €5000/month

**Scaling**:
- Additional areas: €200/area/month
- Additional agents: €50/agent/month (beyond tier default)
- Concurrent listing overage: €5/listing/month

**Promotion**: Platform can offer free tiers temporarily to build network effects.

**Forecast (Year 1)**: 200 agencies × €800/month avg = €1.92M recurring

---

### 3. Professional Investors (Premium)
**Model**: Tiered access to advanced features (pricing TBD based on feature delivery)

#### Tier Features
- **Whitelist Access**: Exclusive access to certified premium properties (varies by whitelist)
- **Complex Alerts**: Rules-based notifications (price, availability, metrics)
- **AI Assistant**: LLM-powered analysis (photo analysis, market reports, investment ROI)
- **Data Export**: Bulk export of property data for analysis
- **Expert Access**: Direct connection to market experts (Phase 2+)
- **Property Management**: Locative services for rental portfolios (Phase 3+)

**Pricing** (to be confirmed): €100–500/month depending on features

**Forecast (Year 1)**: 50 investors × €200/month = €120K recurring

---

## Success Metrics (Year 1)

### Primary (Traffic-First)
- **Searchers**: 10,000+ monthly active users
- **Listings**: 500+ active listings across all markets
- **Contact Inquiries**: 2,000+ per month (searcher→owner/agency messages)
- **Map Searches**: 50,000+ monthly searches

### Secondary (Monetization)
- **Owner Subscriptions**: 1,000+ active
- **Agency Subscriptions**: 50+ active
- **Investor Subscriptions**: 20+ active
- **Monthly Recurring Revenue (MRR)**: €30,000+ (from all sources)

### Operational
- **Listing Renewal Rate**: 60%+ (owners renewing after expiry)
- **Agent Utilization**: 4.5 average agents per agency (vs. 5 default limit)
- **Response Time**: <4 hours average (searcher→agency response)

---

## Core Features (MVP vs. Phase 2+)

### MVP (Phase 1: 3 Months)

#### Map-Based Search (MUST HAVE)
- ✅ Pan/zoom map interface
- ✅ Basic filters: price range, property type, contract type, location (country/region/city)
- ✅ Click marker → property details (photos, description, contact)
- ✅ Marker clustering (for dense areas)
- ✅ **Proximity/Amenity Filters**: Search within distance of schools, transit, shopping, etc.
  - Distance options: 500m, 1km, 2km, 5km, etc.
  - Amenity types: Schools (with ratings), transit stops, hospitals, parks, shops, restaurants
  - Distance metrics: Walking, driving, bird-flight
  - Example: "Rentals within 1km of primary school (rating >4)"

#### Property/Asset & Listing Management (MUST HAVE)
- ✅ Owner creates Asset (property definition with metadata)
- ✅ Owner creates Listing(s) on Asset (contract type, price, duration)
- ✅ Owner publishes listing by paying (per-listing) or via subscription (credit-based)
- ✅ Credit system: Owner purchases visibility periods (30/90 days) applied at publish
- ✅ Listing visible on map for duration, auto-hidden on expiry
- ✅ Owner dashboard: View owned assets, active listings, visibility schedule, renewal options
- ✅ Owner can disable/pause listing anytime
- ✅ Asset becomes unavailable (rented, renovation) → hides related listings
- ✅ Owner can reactivate asset and re-publish listings

#### Agency Management (MUST HAVE)
- ✅ Agency creates account, buys subscription (area + listing slots)
- ✅ Agency buys geographic area(s) (country/region/city)
- ✅ Agency creates agent accounts (default 5, varies by tier)
- ✅ Agents inherit area restrictions (can only list in agency's areas)
- ✅ Agents can create/edit listings (workflow same as owner)
- ✅ Agency dashboard: View all agents, listing portfolio, area coverage, subscription details
- ✅ Role-based agent permissions (optional for MVP, default: all agents can create listings)

#### Contact Workflow (MUST HAVE)
- ✅ **Searcher (logged in)**: No form needed, sends message directly from listing detail page
- ✅ **Searcher (logged out)**: Prompted to login/register, then send message
- ✅ **Message Routing**: Platform routes to owner/agency email + in-app inbox
- ✅ **Searcher Profile**: Owner/agency sees searcher profile (name, rating), NOT email
- ✅ **Distribution List (Agencies)**: By default, all agency members see messages, all can respond
  - `all_members` is default distribution list
  - Optional: Agency can create custom lists (commercial_realestate, by_region, by_agent)
- ✅ **Message Threading**: Conversations appear as threads in inbox
- ✅ **In-App Messaging**: Alternative to email for real-time communication

#### Views Tracking (SHOULD HAVE)
- ✅ Track unique views separately:
  - Preview card view (marker click on map)
  - Listing detail view (full property page)
- ✅ Platform counts per listing, per area, per agency (for analytics dashboard)
- ✅ Use accepted practices for unique viewer identification

---

### Phase 2 (Enhanced Features: Months 4–6)

#### Whitelist & Premium Listings (DEFER)
- 🔄 Platform-managed whitelists (Luxury, Investment, Rare, etc.)
- 🔄 Certification process: Platform identifies exceptional properties meeting conditions
- 🔄 Can involve agencies as partners in certification
- 🔄 Multiple whitelists per investor interest (public and selective)
- 🔄 Platform proposes exceptional listings to owners/agencies for whitelist inclusion
- 🔄 Limited-time exclusivity options for agencies

#### Advanced Alerts & Analytics (DEFER)
- 🔄 Simple alerts: Filters on region, asset type, contract type (daily/weekly)
- 🔄 Complex alerts: Add metrics (price trends, rarity scores, below-average pricing)
- 🔄 Alert recalculation: Periodic (nightly job)
- 🔄 Analytics dashboard: Views per listing/area/agency, market trends

#### AI Assistant (DEFER)
- 🔄 LLM-powered agent with access to platform MCP servers
- 🔄 Capabilities:
  - Photo analysis (detect condition, features, issues)
  - Media processing (videos, schematics, architectural plans, ecological data)
  - Complex analysis: Investment ROI, market comparisons
  - Report generation: Custom investor reports on platform data

#### Agent Permissions (DEFER)
- 🔄 Granular roles: Listing Creator, Visit Scheduler, Inquiry Responder, etc.
- 🔄 Per-agent permission configuration
- 🔄 Custom distribution lists per agency

---

### Phase 3+ (Property Management & Ecosystem)

- 🔄 **Locative (Property Management)**: Rent collection, tenant management, maintenance
- 🔄 **Airbnb-Style Booking**: Calendar availability, instant/request booking, payment processing
- 🔄 **Commercial/Industrial**: Extend asset types for commercial real estate
- 🔄 **Agricultural**: Extend for agricultural properties
- 🔄 **Expert Services**: Appraisals, inspections, property management referrals
- 🔄 **Market Data APIs**: Third-party integrations (crime, schools, transport)

---

## User Personas & Journeys

### Searcher (Traffic Driver)
**Goal**: Find the perfect property efficiently using map and filters

**Journey**:
1. Open map
2. Search by location + filters (price, bedrooms, proximity to school)
3. Browse results as pins on map
4. Click pin → preview card (fast view)
5. Click "See Details" → full property page (photos, description, owner contact)
6. Click "Contact" → login/register if needed → send inquiry
7. Receive response from owner/agency (email/in-app)

**Success**: Found property and made contact

---

### Owner (Direct Listing - P2P)
**Goal**: List property and get inquiries

**Journey**:
1. Create account
2. Create Asset (property metadata: address, bedrooms, bathrooms, photos, description)
3. Create Listing (contract type, price, duration, availability)
4. Validate listing (required fields, photos, description)
5. Publish listing:
   - Option A: Pay €20–50 (30/90 days)
   - Option B: Subscribe to plan (1/5/unlimited concurrent listings)
6. Listing appears on map within minutes
7. Receive inquiries via email/in-app
8. Respond to searchers directly
9. View analytics: # views, # inquiries, renewal deadline

**Success**: Listing generates inquiries

---

### Agent (Agency Listing)
**Goal**: List agency properties and manage inquiries

**Journey**:
1. Invited by agency → create account
2. Assigned to agency + geographic area(s)
3. Create Asset (same as owner)
4. Create Listing (same as owner)
5. Publish listing (covered by agency subscription, no individual payment)
6. Listing appears on map under agency branding
7. All agency inquiries routed to agency email/in-app (distribution list)
8. Agency members respond collaboratively
9. View agency portfolio: all listings, view counts, inquiry source

**Success**: Agency properties generate leads

---

### Agency (Subscription)
**Goal**: Manage agents, listings, and geographic territories

**Journey**:
1. Create account
2. Buy subscription: Select tier (Local/Regional/National) + geographic area(s)
3. Create agent accounts (up to tier limit, e.g., 5 for Tier Local)
4. Agents start creating listings (no additional payment)
5. Agency dashboard shows:
   - All agents and their status
   - All listings + status (active, pending, expired)
   - Geographic coverage + competitiveness (# listings per area)
   - Inquiry volume + response metrics
   - Subscription expiry + renewal options
6. Upgrade tier if needed (more agents, more areas, more listings)

**Success**: Manage growing portfolio efficiently

---

### Professional Investor (Premium)
**Goal**: Find exceptional investment properties with advanced tools

**Journey**:
1. Create account + request investor tier
2. Subscribe to investor plan (€X/month)
3. Access features:
   - Browse whitelist properties (curated, exceptional)
   - Set complex alerts (price <avg in area, rarity score >8, etc.)
   - Use AI Assistant to analyze properties (ROI, risk assessment)
   - Export data for analysis
   - Contact curated agencies directly for investment deals
4. Receive personalized whitelist recommendations
5. Close on properties through platform-connected agents

**Success**: Access deal flow, make informed investments

---

## Data Model Overview

See `docs/PROJECT_CONTEXT.md` for detailed schema.

### Core Entities
- **User**: Searcher, owner, agent, investor with roles + permissions
- **Property**: Extensible asset hierarchy (residential, commercial, land, sub-properties)
- **Listing**: Time-bound contract on property (sale, rent, airbnb, lease)
- **Agency**: Organization managing agents and geographic territories
- **Area**: Geographic boundary (country/region/city/neighborhood)
- **Subscription**: Ties user/agency to features and limits
- **Message**: Contact inquiry from searcher to owner/agency
- **Whitelist**: Curated list of exceptional properties for investor access

### Relationships
- Property 1→* Listing (multiple contracts, sequential)
- Agency 1→* Area (multiple territories)
- Agency 1→* Agent (multiple staff)
- Agency 1→* Listing (properties agent created)
- User 1→* Message (inquiries sent/received)
- Property 1→* Sub-Property (garage, rooms as standalone listings)

---

## Technical Constraints & Considerations

### Scalability
- **Target Year 1**: 10,000 searchers, 500 listings, 50 areas, 10 for Belgium
- **Design for 10x growth**: Expect geographic expansion, feature expansion
- **Map tile caching**: Expensive if not optimized (use Mapbox or similar)
- **Search indexing**: Need full-text + geospatial indexes (PostGIS in PostgreSQL)

### Data Import
- **OSM (OpenStreetMap)**: Import building data, boundaries, POIs (schools, transit, etc.)
- **Real Estate Transactions**: Historical data on sold/rented properties (for market analysis)
- **Timeline**: Must complete BEFORE MVP launch (not in critical path for web development)

### Multi-Country
- **Contract Types**: Vary by country (e.g., Belgium uses "vente/location", France "vente/location/Airbnb/bail")
- **Subscription Tiers**: Pricing and allowances vary per country
- **Regulation**: Each country has different real estate regulations (defer to Phase 2 compliance review)
- **Languages**: Support French, Dutch, German, English (MVP may start with 1-2 languages)

### Security & Compliance
- **PII**: Minimal collection (email, name for searcher profile)
- **GDPR**: Required for Belgium, Holland, Switzerland
- **Payment**: Use Stripe or similar for billing (PCI compliance delegated)
- **Trust & Safety**: Review whitelist applications, moderate listings (Phase 2)

---

## Roadmap

### MVP (Phase 1: Jan–Mar 2026)
**Focus**: Searcher-first map search + basic listing + contact workflow

**Deliverables**:
- Map search (pan/zoom, filters, proximity/amenities)
- Property + Listing management (owner, agent)
- Contact workflow (message routing)
- Agency subscription (area + listing slots)
- Views tracking
- Credit system for owner visibility

**Go-Live**: Belgium, Holland, Switzerland

**Success Criteria**: 10k searchers, 500 listings, 50+ areas

### Phase 2 (Apr–Jun 2026)
**Focus**: Premium features + advanced analytics + agency tools

**Deliverables**:
- Whitelist + certification process
- Complex alerts + analytics dashboard
- AI Assistant (photo analysis, reports)
- Granular agent permissions
- Custom distribution lists

**Success Criteria**: 20k searchers, 2000 listings, 150+ agencies

### Phase 3 (Jul–Sep 2026)
**Focus**: Property management + expanded ecosystem

**Deliverables**:
- Locative (rent collection, tenant management)
- Airbnb-style booking + calendar
- Commercial/industrial asset types
- Expert services marketplace
- International expansion (France, Spain, Italy)

---

## Open Questions Resolved ✅

- ✅ Subscription model: Pay-per-listing + subscription options (credit-based)
- ✅ Agency wholesale: Geographic territories + tiered listing allowances
- ✅ Owner onboarding: Asset → Listing → Publish (with payment/subscription)
- ✅ Contact workflow: Platform mediates, routes to email/SMS/in-app, distribution lists
- ✅ Whitelist: Platform-maintained, certification-based, multiple curated lists
- ✅ MVP timeline: 3 months (Belgium, Holland, Switzerland)
- ✅ Asset model: Extensible hierarchy with sub-properties
- ✅ Scalability: Designed from start (10k searchers, 500 listings, 50 areas)

---

## Next Steps (Hand-Off to Orchestrator)

✅ **Product Vision**: Complete, stakeholder approved

**Deliverables for Orchestrator**:
1. `specs/USER_STORIES.md` — Detailed user stories per persona
2. `specs/features/` — Individual feature specs (map-search.md, listing.md, etc.)
3. `docs/PROJECT_CONTEXT.md` — Complete data model
4. `specs/NFR.md` — Performance, security, compliance
5. `IMPLEMENTATION_CHECKLIST.md` — MVP roadmap with phases
6. `specs/bdd/*.feature` — Gherkin scenarios for testing

**Orchestrator Actions**:
1. Review specs for completeness
2. Assign Database agent: Design schema (Property, Listing, Agency, Area, Subscription)
3. Assign Test agent: Create test plan from BDD scenarios
4. Gate implementation: No coding until specs reviewed + tests defined

---

**Status**: ✅ Requirements phase complete  
**Approved By**: Product Owner Agent  
**Ready For**: Implementation Planning (Orchestrator)
