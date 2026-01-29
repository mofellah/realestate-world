# Phase 4 Planning - Integration & Refinement

**Prepared By**: Orchestrator  
**Target Start**: 2026-02-05 (when Phase 3 complete)  
**Duration**: 2-3 weeks  
**End Date**: 2026-02-18  

---

## Phase 4 Vision

**Goal**: Integrate all backend services into cohesive APIs with comprehensive testing

**Scope**:
1. **Property Search API** - Advanced filtering, pagination, sorting
2. **Listing Search API** - Complex queries across multiple fields
3. **Messaging System** - Real-time communication between users
4. **Agency Management** - Dashboard and admin features
5. **Integration Tests** - API contract testing
6. **E2E Tests** - Complete user workflows

---

## Services to Build

### 1. Search Service

**File**: `apps/backend/src/search/search.service.ts`

```typescript
class SearchService {
  searchProperties(filters: PropertySearchFilters): Promise<Property[]>
  searchListings(filters: ListingSearchFilters): Promise<Listing[]>
  getPropertyDetails(id: string): Promise<PropertyDetail>
  getListingDetails(id: string): Promise<ListingDetail>
}
```

**Filters**:
```typescript
interface PropertySearchFilters {
  location: GeometryFilter      // Polygon/bbox
  priceRange: [min, max]
  propertyType: PropertyType[]
  amenities: string[]
  availability: DateRange
  agency?: string
  sortBy: 'price' | 'newest' | 'relevance'
  pagination: { skip, take }
}
```

**Tests**: 15+ (filtering, pagination, sorting, edge cases)

---

### 2. Messaging Service

**File**: `apps/backend/src/messages/messages.service.ts`

```typescript
class MessagesService {
  sendMessage(from: string, to: string, text: string): Promise<Message>
  getConversation(userId: string, participantId: string): Promise<Message[]>
  listConversations(userId: string): Promise<Conversation[]>
  markAsRead(messageId: string): Promise<void>
}
```

**Features**:
- Real-time message delivery (WebSocket ready)
- Conversation grouping
- Read receipts
- Unread message counts

**Tests**: 12+ (send, fetch, read, edge cases)

---

### 3. Agency Service

**File**: `apps/backend/src/agency/agency.service.ts`

```typescript
class AgencyService {
  createAgency(data: CreateAgencyDTO): Promise<Agency>
  getAgencyProfile(id: string): Promise<Agency>
  updateAgencyProfile(id: string, data): Promise<Agency>
  addAgentToAgency(agencyId: string, userId: string): Promise<void>
  getAgencyListings(id: string): Promise<Listing[]>
  getAgencyStats(id: string): Promise<AgencyStats>
}
```

**Stats**:
- Active listings count
- Monthly revenue
- Agent count
- Average response time
- Rating/reviews

**Tests**: 14+ (CRUD, permissions, stats)

---

### 4. Filter/Search Engine

**Library**: Elastic integration (optional for MVP)

**MVP Approach**: PostgreSQL FTS (Full-Text Search)

```typescript
// Use PostgreSQL for MVP
SELECT p.*, ts_rank(p.search_vector, plainto_tsquery($1)) as rank
FROM properties p
WHERE p.search_vector @@ plainto_tsquery($1)
ORDER BY rank DESC
```

**Migration Path**:
- Week 1: PostgreSQL FTS
- Week 2: Elasticsearch optional
- Week 3: Performance tuning

---

## Testing Strategy

### Integration Tests (API Contract)

**Format**: Jest + Supertest

**Example**:
```typescript
describe('Property Search API', () => {
  it('should filter by price range', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/search/properties')
      .query({ minPrice: 1000, maxPrice: 5000 })
      .expect(200);
    
    expect(response.body.properties).toAllSatisfy(p => 
      p.price >= 1000 && p.price <= 5000
    );
  });
});
```

**Coverage**:
- 50+ integration tests
- All endpoints tested
- Happy path + error cases
- Authentication/authorization

### E2E Tests (User Workflows)

**Format**: Cypress

**Example Workflows**:
1. User searches properties → filters results → views details → contacts agency
2. Agency admin creates listing → marks as active → views inquiries
3. Buyer sends message → seller responds → negotiation chain
4. Search by amenity → filter by price → sort by newest → pagination

**Coverage**: 10+ critical workflows

---

## API Endpoints (Phase 4)

### Search Endpoints

```
GET    /api/search/properties         # Search with filters
GET    /api/search/listings           # Search listings
GET    /api/properties/:id/details    # Full property details
GET    /api/listings/:id/details      # Full listing details
```

### Messaging Endpoints

```
POST   /api/messages                  # Send message
GET    /api/messages/conversations    # List conversations
GET    /api/messages/:conversationId  # Get conversation
PUT    /api/messages/:messageId/read  # Mark as read
```

### Agency Endpoints

```
POST   /api/agencies                  # Create agency
GET    /api/agencies/:id              # Get agency profile
PUT    /api/agencies/:id              # Update profile
POST   /api/agencies/:id/agents       # Add agent
GET    /api/agencies/:id/listings     # List agency listings
GET    /api/agencies/:id/stats        # Get agency statistics
```

---

## Database Optimizations

### Indexes to Add

```prisma
// Search performance
model Property {
  @@index([location])         // Geo queries
  @@index([propertyType])     // Type filtering
  @@index([createdAt])        // Sorting
  @@fulltext([title, description])  // Text search
}

model Listing {
  @@index([propertyId])       // Join properties
  @@index([pricePerMonth])    # Price filtering
  @@index([type])             # Type filtering
  @@index([status])           # Status filtering
}

model Message {
  @@index([senderId, recipientId])  // Conversation lookup
  @@index([createdAt])              // Ordering
  @@index([isRead])                 # Unread filter
}
```

### Query Optimization

- Connection pooling (PgBouncer)
- Query caching for frequently accessed data
- Denormalized agency stats table (trigger updates)
- Materialized views for search results (optional)

---

## Performance Targets

### API Response Times

| Endpoint | Target | Current |
|----------|--------|---------|
| Search properties | <500ms | TBD |
| Search listings | <500ms | TBD |
| Get property details | <100ms | TBD |
| Send message | <200ms | TBD |
| Get conversations | <300ms | TBD |
| Get agency stats | <400ms | TBD |

### Database Metrics

- Queries: <100ms p95
- Connections: <100 active
- Data size: <5GB
- Transaction time: <50ms p95

---

## Timeline

### Week 1 (Feb 5-11)

- [x] Database indexes added
- [ ] Search service implemented (15 tests)
- [ ] Search API endpoints (5 endpoints)
- [ ] Search integration tests (20 tests)

**Goal**: Search MVP complete

---

### Week 2 (Feb 12-18)

- [ ] Messaging service implemented (12 tests)
- [ ] Messaging API endpoints (4 endpoints)
- [ ] Agency service implemented (14 tests)
- [ ] Agency API endpoints (6 endpoints)
- [ ] Integration tests (30 tests)

**Goal**: Core APIs complete

---

### Week 3 (Feb 19-25) - Optional Stretch

- [ ] E2E tests (Cypress, 10+ workflows)
- [ ] Performance testing (load tests)
- [ ] Elasticsearch optional integration
- [ ] Advanced filtering (complex queries)

**Goal**: Production-ready testing

---

## Agent Assignments (Phase 4)

### Coder Agent

**Task**: Implement all 4 services + 6 controllers

**Deliverables**:
- SearchService + SearchController (5 endpoints)
- MessagesService + MessagesController (4 endpoints)
- AgencyService + AgencyController (6 endpoints)
- Filter utilities and query builders

**Effort**: ~40 hours (2 weeks)

**Success**: All services tested, 100% type-safe, no errors

---

### Test Agent

**Task**: Integration tests + E2E tests

**Deliverables**:
- 50+ integration test cases
- 10+ E2E test scenarios (Cypress)
- API contract tests
- Error case testing

**Effort**: ~30 hours (2 weeks)

**Success**: 95%+ coverage, all workflows tested

---

### Database Agent

**Task**: Query optimization + performance

**Deliverables**:
- Add indexes to schema
- Create denormalized stats table
- Write aggregate queries
- Performance monitoring setup

**Effort**: ~20 hours (1 week)

**Success**: All queries <500ms p95

---

### DevOps Agent

**Task**: Performance testing infrastructure

**Deliverables**:
- Load testing setup (k6 or Apache Bench)
- Performance dashboards
- CI/CD performance gates
- Database monitoring

**Effort**: ~15 hours (1 week)

**Success**: Performance metrics tracked, gates in place

---

## Phase 4 Exit Criteria

### ✅ Code Quality

- [ ] All 4 services implemented
- [ ] 6 controllers with full endpoints
- [ ] 80+ integration tests
- [ ] 100% type-safe (no `any`)
- [ ] Build succeeds, lint passes

### ✅ Testing

- [ ] 95%+ code coverage
- [ ] All 80+ integration tests passing
- [ ] All 10+ E2E workflows passing
- [ ] Error cases covered
- [ ] Performance targets met

### ✅ Performance

- [ ] Search API <500ms
- [ ] Message API <200ms
- [ ] Agency API <400ms
- [ ] All queries optimized
- [ ] No N+1 problems

### ✅ Documentation

- [ ] API documentation complete
- [ ] Performance metrics documented
- [ ] Database query patterns documented
- [ ] Developers can extend APIs

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Search performance slow | Medium | Add indexes early, test with >1M records |
| N+1 queries in listing joins | Medium | Use DataLoader, batch queries in tests |
| Messaging scalability | Low | Design for WebSocket upgrade, use Redis |
| Agency stats expensive | Medium | Denormalize, cache, async updates |
| Test data volume | Low | Use factories, keep test data minimal |

---

## Success Metrics (Phase 4 Complete)

```
✅ Services Implemented: 4/4
✅ Controllers Complete: 6/6
✅ Integration Tests: 80+/80+
✅ E2E Tests: 10+/10+
✅ Code Coverage: 95%+
✅ API Response Times: All <500ms
✅ Build: ✅ Lint: ✅ Type-check: ✅
✅ Phase 4 Ready for MVP Launch
```

---

## Phase 5 Preview (Post-MVP)

Once Phase 4 complete, Phase 5 will add:
- User reviews and ratings
- Advanced payment processing
- Automated email notifications
- Real-time notifications (WebSocket)
- Analytics dashboard
- Admin panel

---

## Handoff Notes

**For Phase 3 Agents**:
- Document all decisions clearly
- Leave schema and code in clean state
- Add code comments explaining complex logic

**For Phase 4 Agents**:
- Review Phase 3 completion gates
- Read all Phase 3 documentation
- Understand existing patterns
- Follow same testing patterns
- Document Phase 4 decisions similarly

**For Orchestrator**:
- Phase 3 must complete with ✅ status
- All tests passing before Phase 4 starts
- All agents signed off
- Ready to gate and proceed to Phase 5 (eventual)

---

**Phase 4 is ready to start when Phase 3 is complete.**  
**Orchestrator will assign Phase 4 agents on Feb 5, 2026.**
