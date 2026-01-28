# Non-Functional Requirements (NFR)

**Last Updated**: 2026-01-27  
**Scope**: MVP Phase 1 (Belgium, Holland, Switzerland)

---

## 1. Performance Requirements

### 1.1 Response Times

| Feature | Target | Notes |
|---------|--------|-------|
| **Map initial load** | <2 seconds | First-time map render with default view |
| **Map pan/zoom** | <500ms | Response to user interaction (50ms interactive) |
| **Filter application** | <500ms | Update markers when filters change |
| **Property search** | <1 second | Database query + response |
| **Listing detail page load** | <2 seconds | Including photos, description, owner profile |
| **Message send** | <5 seconds | Includes email routing, in-app notification |
| **Message notification** | <10 minutes | Email delivery to distribution list |
| **Agency dashboard** | <2 seconds | Load with 100+ listings and 10+ agents |

### 1.2 Scalability Assumptions

**Year 1 Targets**:
- **Concurrent Users**: 100 simultaneous (peak hours)
- **Daily Active Users**: 1,000
- **Listings**: 500 active at launch, 2,000+ by end of year
- **Searchers**: 10,000+ by end of year
- **Areas**: 50 areas (Belgium/Holland/Switzerland combined)
- **Agencies**: 50 by end of year
- **Messages/day**: 100 (growing to 1,000+ by year end)

**Infrastructure**:
- CDN for static assets (photos, JS bundles)
- Database connection pooling (to handle 100+ concurrent connections)
- In-memory cache (Redis) for frequently accessed data (area definitions, property counts)
- Search indexing (PostgreSQL full-text or Elasticsearch for future scaling)

### 1.3 Data Volume

| Entity | Year 1 | Notes |
|--------|--------|-------|
| **Properties** | 1,000 | Some owners have multiple properties |
| **Listings** | 2,000 | Multiple listings per property over time |
| **Messages** | 100,000 | ~100 messages/day × 365 days |
| **Views** | 500,000 | ~1500 views/day |
| **Users** | 10,000+ | Searchers + owners + agents + agencies |
| **Photos** | 20,000 | ~10 photos per property |
| **Photo Storage** | 100 GB | Assuming 5MB average per photo |

---

## 2. Availability & Reliability

### 2.1 Uptime SLA

**MVP (Year 1)**: 99% uptime (8.7 hours downtime/month allowed)

**Hosting**:
- Cloud infrastructure (AWS/Azure/GCP) with multi-AZ deployment
- Auto-scaling to handle traffic spikes
- Database backups (daily, tested monthly)
- Disaster recovery plan (RTO <4 hours, RPO <1 hour)

### 2.2 Error Handling

**Graceful Degradation**:
- Map not loading? Show list view of properties (fallback)
- Email delivery down? Queue messages, retry with exponential backoff
- Photo upload fails? Show error, allow retry without losing form data
- Search slow? Paginate results, don't show "no results" if timeout

**User Feedback**:
- Error messages plain language (not technical)
- Suggestion for action: "Having trouble? Try [action]"
- Estimated recovery time: "We're fixing this, back online in ~1 hour"

### 2.3 Monitoring

**Metrics to Track**:
- API response times (p50, p95, p99)
- Error rates per endpoint
- Database query performance
- Message delivery success rate
- Photo upload success rate
- Map tile load times

**Alerting**:
- Endpoint >2s avg response → alert
- Error rate >1% → alert
- Message queue depth growing → alert
- Database connection pool exhausted → alert

---

## 3. Security

### 3.1 Authentication & Authorization

**Login**:
- Email + password (bcrypt hashing)
- Optional: Social login (Google, Facebook) Phase 2
- Session tokens (JWT) with 1-hour expiry + refresh token (7 days)
- "Remember me" optional (extends refresh token to 30 days)

**Authorization**:
- Role-based access control (RBAC):
  - **Searcher**: View listings, send messages, manage own inbox
  - **Owner**: Manage own assets/listings, view own inquiries
  - **Agent**: Create listings in agency areas, see agency inquiries
  - **Agency**: Manage agents, view portfolio, manage subscription
  - **Admin**: Manage all content, handle disputes (Phase 2)

**Permission Examples**:
- Can't edit listings outside agency's areas
- Can't view other owner's assets
- Can't see searcher's email address (only profile)

### 3.2 Data Protection

**PII Handling**:
- **Minimal Collection**: Email, name, phone (for owner/agent)
- **Searcher Profile**: Name, optional photo, rating (public)
- **Encryption**: 
  - HTTPS only (all traffic encrypted)
  - Passwords hashed (bcrypt, not reversible)
  - Sensitive data encrypted at rest (database encryption)
- **Retention**: Delete inactive accounts after 2 years (Phase 2 policy)

**GDPR Compliance** (Belgium, Holland, Switzerland):
- Privacy policy clear and accessible
- Consent collection (implicit via account creation)
- Data export feature (users can download their data)
- Account deletion (hard delete, not soft delete)
- Right to be forgotten: Delete all PII, keep anonymized records

### 3.3 API Security

**Rate Limiting**:
- Login: 5 attempts per IP per hour (prevents brute force)
- API calls: 100 per minute per user (prevents DoS)
- File upload: 10 per hour per user (prevents spam)

**Input Validation**:
- All API inputs validated (type, length, format)
- XSS prevention: Sanitize all text inputs
- SQL injection prevention: Use parameterized queries (Prisma)
- CSRF protection: Validate origin header for state-changing requests

**API Key Security**:
- If using API keys for integrations: Store encrypted, rotate monthly
- Never log sensitive data (passwords, tokens)

### 3.4 Payment Security

**Stripe Integration**:
- Use Stripe for payment processing (PCI compliance handled by Stripe)
- Never store full credit card numbers (Stripe tokens only)
- Webhook signature validation (verify Stripe origin)
- Handle failed payments: Retry logic + user notification

---

## 4. Compliance & Legal

### 4.1 Regulations

**Real Estate (Varies by Country)**:
- Belgium: Must register certain deals, no misleading information
- Holland: Similar, plus energy rating required
- Switzerland: Cantonal-level regulations

**Deferred to Phase 2 (MVP focuses on tech foundation)**:
- Real estate license checks (agents must be licensed)
- Property verification (ownership proof)
- Fair housing (no discrimination in listings)

### 4.2 Content Moderation

**MVP Approach** (Manual):
- Flag system: Users report inappropriate listings
- Manual review by team before publishing (deferred to Phase 2)
- Remove spam, offensive content

**Phase 2+ (Automated)**:
- AI content moderation (detect spam, adult content, etc.)
- Auto-remove listings violating policy
- Appeal process

### 4.3 Trust & Safety

**Owner/Agent Verification**:
- Email verification (must confirm email to publish)
- Phone verification (optional, for agencies, Phase 2)
- Review history: Show owner/agent rating (based on feedback)

**Listing Verification**:
- Property address validation (use geocoding API)
- No duplicate listings (same address, same contract type, created by same owner)
- Whitelist certification (Phase 2)

---

## 5. Data Model & Database

### 5.1 Database Choice

**PostgreSQL 18** (already in boilerplate):
- ACID compliance (safe transactions)
- JSONB support (flexible schemas for property attributes)
- PostGIS extension (geospatial queries for map)
- Full-text search (for property descriptions)

### 5.2 Key Entities

See `docs/PROJECT_CONTEXT.md` for complete schema.

**Core Tables**:
- **User** (searchers, owners, agents, admin)
- **Property** (asset with metadata)
- **Listing** (contract on property)
- **Agency** (organization)
- **Area** (geographic boundary)
- **Subscription** (tied to user/agency)
- **Message** (inquiry from searcher)
- **View** (tracking listingviews)

### 5.3 Indexes

**Critical for Performance**:
- Property.location (geospatial index for map queries)
- Listing.expiryDate (for finding expired listings)
- Listing.status (filter active vs. expired)
- Message.recipientId (fast inbox lookup)
- User.email (unique, fast login)

---

## 6. Observability & Logging

### 6.1 Logging

**What to Log** (avoid PII):
- All API requests (endpoint, user ID, duration, response status)
- All database queries (slow queries >1s)
- All authentication attempts (success/failure)
- All payment transactions (amount, status, timestamp)
- All errors (stack trace, context)

**Where to Log**:
- Console (development)
- File (staging/production)
- Cloud logging (AWS CloudWatch / Azure Monitor)

**Format**:
- JSON structured logging (timestamp, level, message, context)
- Correlation ID on each request (X-Trace-ID) for debugging

### 6.2 Metrics

**Key Metrics**:
- API response times (p50, p95, p99)
- Error rates per endpoint
- Database connection pool usage
- Message queue depth
- Payment success rate
- View count (validation)

**Monitoring Tools**:
- Application Performance Monitoring (APM): New Relic, Datadog, or open-source (Prometheus)
- Real-time dashboards in Grafana

---

## 7. Internationalization (i18n) & Multi-Country

### 7.1 Language Support

**MVP Launch**:
- English (primary)
- Dutch (Belgium/Holland)
- French (Belgium/Switzerland)
- German (Switzerland, optional)

**Future**:
- More languages per market expansion

### 7.2 Multi-Country Differences

**Subscription Tiers**:
- Vary per country (e.g., Tier Local = 1 area in Belgium, 1 city in France)
- Pricing in local currency
- Tax/VAT handling per country

**Contract Types**:
- Belgium: Vente, Location
- Holland: Koop, Huur
- Switzerland: Kauf, Miete
- Future France: Vente, Location, Airbnb, Bail

**Regulations**:
- Different rules per country (deferred to Phase 2)

**Implementation**:
- Store country_code on user/property/listing
- Database stores subscription tiers per country
- Frontend i18n library (i18next) for translations
- Contract type definitions per country

---

## 8. Browser & Device Support

### 8.1 Desktop (Chrome, Firefox, Safari, Edge)

**Minimum**:
- Chrome 90+ (released Apr 2021)
- Firefox 88+
- Safari 14+
- Edge 90+

**Features**:
- Full map interaction
- Full feature set

### 8.2 Mobile (iOS Safari, Chrome Android)

**Minimum**:
- iOS Safari 14+
- Chrome Android 90+

**Features**:
- Map responsive (full-width)
- Touch-friendly (larger buttons)
- Photo upload from camera
- In-app messaging

**Performance**:
- Lazy load images (load visible first)
- Infinite scroll on property lists (vs. pagination)
- Service Worker for offline support (Phase 2)

### 8.3 Accessibility

**WCAG 2.1 AA** (baseline for MVP):
- Color contrast 4.5:1 for text
- Keyboard navigation (all features)
- Screen reader compatible (alt text for images)
- Focus indicators (visible outlines)

---

## 9. Email & Communication

### 9.1 Email Delivery

**Transactional Emails**:
- Account creation confirmation
- Password reset
- Listing published confirmation
- Listing expiry reminder (7 days before)
- New inquiry notification
- Agency subscription confirmation + renewal

**Email Provider**:
- SendGrid / Mailgun / AWS SES
- Delivery SLA: 95%+ (within 5 minutes)

### 9.2 SMS (Phase 2)

**Optional**: SMS alerts for urgent messages (phone number stored optionally)

---

## 10. External Integrations

### 10.1 Geolocation & Maps

**Map Provider**:
- Mapbox (recommended) or Google Maps
- Mapbox advantages: $5/1000 requests, customizable
- Google Maps advantages: Familiar, more features

**Data**:
- OpenStreetMap for boundaries and POIs
- Geocoding API (convert address to lat/long)
- PostGIS for geospatial queries

### 10.2 Payment Processing

**Stripe**:
- Credit card payment
- Recurring billing (subscriptions)
- Invoicing
- Webhook handling (payment success/failure)

### 10.3 Data Imports (Before MVP Launch)

**Critical**:
- OSM building data (property locations)
- Real estate transaction history (for market analysis, Phase 2)
- School data (location + ratings)
- Transit stop data (location + type)

**Timing**: Must complete BEFORE MVP launch (not on critical path for code)

---

## 11. Testing & Quality

### 11.1 Test Coverage Targets

- **Backend**: 80%+ unit test coverage (services, controllers)
- **Frontend**: 70%+ component coverage (React components, hooks)
- **Integration**: Core user journeys (map search, listing, contact)
- **E2E**: Critical paths (Cypress)

### 11.2 Test Types

| Type | Coverage | Tools |
|------|----------|-------|
| **Unit** | Functions, services | Jest |
| **Integration** | Database, API endpoints | Jest + test database |
| **E2E** | User journeys | Cypress |
| **Performance** | Map load <2s, filter <500ms | Lighthouse, k6 |
| **Accessibility** | WCAG 2.1 AA | axe-core, manual testing |

---

## 12. Deployment & Rollout

### 12.1 Deployment Strategy

**Staging**:
- Full production-like environment
- Smoke tests before production deploy
- Manual QA on staging

**Production**:
- Blue-green deployment (instant rollback if issues)
- Feature flags for gradual rollout (Phase 2)
- Canary deployment: 10% traffic for 1 hour before full rollout

### 12.2 Rollout Timeline (MVP)

- **Week 1-2**: Internal testing (team only)
- **Week 3**: Beta launch (100 users, Belgium only)
- **Week 4**: Public launch (Belgium, Holland, Switzerland)

---

## 13. Infrastructure

### 13.1 Hosting

**Recommended**:
- AWS (proven, scalable) or Azure (Microsoft ecosystem)
- Container orchestration (Kubernetes via ECS/AKS)
- Serverless for background jobs (Lambda/Functions)

**Services**:
- Application (Docker on ECS/AKS)
- Database (RDS PostgreSQL, managed)
- Storage (S3 for photos, CloudFront CDN)
- Email (SES / SendGrid)
- Monitoring (CloudWatch / Monitor)

### 13.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Users (Searchers, Owners, Agents)        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      CloudFront CDN                          │
│              (Static assets, photo caching)                  │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
                 ▼                            ▼
        ┌──────────────────────────────────────────────┐
        │        Application Load Balancer             │
        └────────────────┬─────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ App    │      │ App    │      │ App    │
    │ Pod 1  │      │ Pod 2  │ ...  │ Pod N  │
    └────────┘      └────────┘      └────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
        ┌──────────────────────────────┐
        │    RDS PostgreSQL (Primary)  │
        │                              │
        │  - Users, Properties,        │
        │  - Listings, Messages, etc.  │
        └──────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────┐
        │  RDS PostgreSQL (Replica)    │
        │  (Read replicas for scaling) │
        └──────────────────────────────┘

        ┌──────────────────────────────┐
        │      Redis Cache             │
        │  (Session, area data)        │
        └──────────────────────────────┘

        ┌──────────────────────────────┐
        │      S3 + CloudFront         │
        │    (Photos, static files)    │
        └──────────────────────────────┘

        ┌──────────────────────────────┐
        │   Message Queue (SQS/RabbitMQ) │
        │   (Email delivery, async jobs)|
        └──────────────────────────────┘
```

---

## 14. Known Limitations & Deferred

### Deferred to Phase 2+

- ❌ AI content moderation
- ❌ Advanced analytics & complex alerts
- ❌ Whitelist certification workflow
- ❌ Property management (locative)
- ❌ Airbnb-style instant booking
- ❌ Credit consumption tracking (implemented but not enforced on UI)
- ❌ Custom agent permissions (all agents same permissions)
- ❌ Real estate license verification
- ❌ SMS notifications
- ❌ Feature flags / gradual rollout
- ❌ API rate limiting (frontend only)

---

**Status**: ✅ Complete, ready for implementation  
**Review Date**: 2026-04-27 (post-MVP)
