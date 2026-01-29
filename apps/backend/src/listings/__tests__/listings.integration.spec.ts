import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ListingsModule } from '../listings.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

/**
 * ListingsController Integration Tests
 * Tests CRUD operations for property listings, publication workflow, and access control
 * Maps to BDD scenarios: property listing, publication, and visibility management
 */
describe('ListingsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let testUser: any;
  let testToken: string;
  let testAddress: any;
  let testPaymentTerms: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ListingsModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    jwtService = moduleFixture.get(JwtService);

    // Setup: Create test user with property and payment terms
    const timestamp = Date.now();
    const person = await prisma.person.create({
      data: {
        email: `owner-person-${timestamp}@test.com`,
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: `owner-user-${timestamp}@test.com`,
        passwordHash: 'hashed',
        personId: person.id,
      },
    });

    testToken = jwtService.sign({ sub: testUser.id });

    // Create test address
    testAddress = await prisma.address.create({
      data: {
        streetName: 'Test Street',
        streetNumber: '42',
        postalCode: '1000',
        city: 'Brussels',
        country_code: 'BE',
      },
    });

    // Create test property
    testProperty = await prisma.property.create({
      data: {
        title: 'Test Property',
        addressId: testAddress.id,
        userId: testUser.id,
        ownerPersonId: person.id,
        propertyType: 'apartment',
        bedrooms: 2,
      },
    });

    // Create test payment terms
    testPaymentTerms = await prisma.paymentTerms.create({
      data: {
        termType: 'onetime',
        currency: 'EUR',
      },
    });
  });

  afterAll(async () => {
    // Cleanup: Delete all test data created by this suite
    // This prevents conflicts with other test suites
    try {
      // Get person ID before deleting user
      const user = await prisma.user.findUnique({ where: { id: testUser.id } });
      const personId = user?.personId;

      // Delete in correct order to respect foreign keys
      await prisma.listing.deleteMany({});
      await prisma.property.deleteMany({
        where: {
          userId: testUser.id,
        },
      });
      await prisma.paymentTerms.deleteMany({
        where: {
          id: testPaymentTerms.id,
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: testUser.id,
        },
      });
      await prisma.address.deleteMany({
        where: {
          id: testAddress.id,
        },
      });
      if (personId) {
        await prisma.person.deleteMany({
          where: {
            id: personId,
          },
        });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
    await app.close();
  });

  afterEach(async () => {
    // Cleanup listings but keep other test data
    await prisma.listing.deleteMany({});
  });

  describe('POST /listings (Create)', () => {
    let localTestProperty: any;
    
    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for each test
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - POST',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty');
      }
    });

    it('should create listing with valid data', async () => {
      const createDto = {
        propertyId: localTestProperty.id,
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
        status: 'draft',
      };

      const response = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('sale');
      expect(response.body.status).toBe('draft');
      expect(response.body.propertyId).toBe(localTestProperty.id);
      expect(response.body.createdBy).toBe(testUser.id);
    });

    it('should create listing with visibility dates', async () => {
      const visibilityStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const visibilityEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const createDto = {
        propertyId: localTestProperty.id,
        type: 'rental',
        paymentTermsId: testPaymentTerms.id,
        status: 'draft',
        visibilityStart,
        visibilityEnd,
      };

      const response = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.visibilityStart).toBe(visibilityStart);
      expect(response.body.visibilityEnd).toBe(visibilityEnd);
    });

    it('should reject create without propertyId', async () => {
      const createDto = {
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject create without type', async () => {
      const createDto = {
        propertyId: localTestProperty.id,
        paymentTermsId: testPaymentTerms.id,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject create without paymentTermsId', async () => {
      const createDto = {
        propertyId: localTestProperty.id,
        type: 'sale',
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject create if not property owner', async () => {
      const otherTimestamp = Date.now() + 1;
      const otherPerson = await prisma.person.create({
        data: {
          email: `other-person-${otherTimestamp}@test.com`,
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          email: `other-user-${otherTimestamp}@test.com`,
          passwordHash: 'hashed',
          personId: otherPerson.id,
        },
      });

      const otherToken = jwtService.sign({ sub: otherUser.id });

      const createDto = {
        propertyId: localTestProperty.id,
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${otherToken}`)
        .send(createDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should reject create with non-existent property', async () => {
      const createDto = {
        propertyId: 'non-existent-id',
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      const createDto = {
        propertyId: localTestProperty.id,
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .send(createDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /listings (List)', () => {
    let localTestProperty: any;
    
    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for each test
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - List',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty for List tests');
      }

      // Create multiple test listings
      for (let i = 0; i < 3; i++) {
        await prisma.listing.create({
          data: {
            propertyId: localTestProperty.id,
            type: i === 0 ? 'sale' : 'rental',
            paymentTermsId: testPaymentTerms.id,
            createdBy: testUser.id,
            status: 'draft',
          },
        });
      }
    });

    it('should list user listings with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('listings');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.listings)).toBe(true);
      expect(response.body.total).toBe(3);
      expect(response.body.listings.length).toBe(3);
    });

    it('should paginate results correctly', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/listings?skip=0&take=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response1.body.listings.length).toBe(2);

      const response2 = await request(app.getHttpServer())
        .get('/listings?skip=2&take=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response2.body.listings.length).toBe(1);
    });

    it('should return ordered by createdAt descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const listings = response.body.listings;
      for (let i = 1; i < listings.length; i++) {
        const prev = new Date(listings[i - 1].createdAt).getTime();
        const current = new Date(listings[i].createdAt).getTime();
        expect(prev).toBeGreaterThanOrEqual(current);
      }
    });

    it('should include relations', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const listing = response.body.listings[0];
      expect(listing).toHaveProperty('property');
      expect(listing).toHaveProperty('paymentTerms');
      expect(listing).toHaveProperty('creator');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/listings')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /listings/:id (Get by ID)', () => {
    let testListing: any;
    let localTestProperty: any;

    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for each test
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - GetById',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty for GetById tests');
      }

      testListing = await prisma.listing.create({
        data: {
          propertyId: localTestProperty.id,
          type: 'sale',
          paymentTermsId: testPaymentTerms.id,
          createdBy: testUser.id,
          status: 'draft',
        },
      });
    });

    it('should get listing by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toBe(testListing.id);
      expect(response.body.type).toBe('sale');
      expect(response.body.status).toBe('draft');
    });

    it('should include all relations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.property).toBeDefined();
      expect(response.body.property.id).toBe(localTestProperty.id);
      expect(response.body.paymentTerms).toBeDefined();
      expect(response.body.creator).toBeDefined();
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .get('/listings/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /listings/:id (Update Status & Visibility)', () => {
    let testListing: any;
    let localTestProperty: any;

    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for each test
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - Patch',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty for Patch tests');
      }

      testListing = await prisma.listing.create({
        data: {
          propertyId: localTestProperty.id,
          type: 'sale',
          paymentTermsId: testPaymentTerms.id,
          createdBy: testUser.id,
          status: 'draft',
        },
      });
    });

    it('should update listing status to published', async () => {
      const updateDto = {
        status: 'published',
      };

      const response = await request(app.getHttpServer())
        .patch(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('published');
    });

    it('should update visibility dates', async () => {
      const visibilityStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const visibilityEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const updateDto = {
        visibilityStart,
        visibilityEnd,
      };

      const response = await request(app.getHttpServer())
        .patch(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.visibilityStart).toBe(visibilityStart);
      expect(response.body.visibilityEnd).toBe(visibilityEnd);
    });

    it('should update visibility days', async () => {
      const updateDto = {
        visibilityDays: 30,
      };

      const response = await request(app.getHttpServer())
        .patch(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.visibilityDays).toBe(30);
    });

    it('should reject update if not listing creator', async () => {
      const otherPerson = await prisma.person.create({
        data: {
          email: `other-${Date.now()}@test.com`,
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@test.com`,
          passwordHash: 'hashed',
          personId: otherPerson.id,
        },
      });

      const otherToken = jwtService.sign({ sub: otherUser.id });

      const updateDto = { status: 'published' };

      await request(app.getHttpServer())
        .patch(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent listing', async () => {
      const updateDto = { status: 'published' };

      await request(app.getHttpServer())
        .patch('/listings/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      const updateDto = { status: 'published' };

      await request(app.getHttpServer())
        .patch(`/listings/${testListing.id}`)
        .send(updateDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /listings/:id (Delete)', () => {
    let testListing: any;
    let localTestProperty: any;

    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for each test
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - Delete',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty for Delete tests');
      }

      testListing = await prisma.listing.create({
        data: {
          propertyId: localTestProperty.id,
          type: 'sale',
          paymentTermsId: testPaymentTerms.id,
          createdBy: testUser.id,
          status: 'draft',
        },
      });
    });

    it('should delete listing by creator', async () => {
      await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify deleted
      await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject delete if not creator', async () => {
      const otherPerson = await prisma.person.create({
        data: {
          email: `other-${Date.now()}@test.com`,
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@test.com`,
          passwordHash: 'hashed',
          personId: otherPerson.id,
        },
      });

      const otherToken = jwtService.sign({ sub: otherUser.id });

      await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .delete('/listings/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('BDD Scenario: Create and Publish Listing', () => {
    let localTestProperty: any;
    
    beforeEach(async () => {
      // Verify test data exists
      const addressExists = await prisma.address.findUnique({ where: { id: testAddress.id } });
      if (!addressExists) {
        throw new Error(`testAddress ${testAddress.id} not found in database`);
      }

      // Create fresh property for BDD scenario
      localTestProperty = await prisma.property.create({
        data: {
          title: 'Test Property - BDD',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: (await prisma.user.findUnique({ where: { id: testUser.id } }))?.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });

      // Verify property was created
      if (!localTestProperty?.id) {
        throw new Error('Failed to create localTestProperty for BDD tests');
      }
    });

    it('should support property listing workflow from draft to published', async () => {
      // Step 1: Create listing (draft status)
      const createDto = {
        propertyId: localTestProperty.id,
        type: 'sale',
        paymentTermsId: testPaymentTerms.id,
        status: 'draft',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      const listingId = createResponse.body.id;
      expect(createResponse.body.status).toBe('draft');

      // Step 2: Update visibility to schedule publication
      const visibilityStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const updateVisibilityDto = {
        visibilityStart,
        visibilityDays: 30,
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateVisibilityDto)
        .expect(HttpStatus.OK);

      expect(updateResponse.body.visibilityStart).toBe(visibilityStart);
      expect(updateResponse.body.visibilityDays).toBe(30);

      // Step 3: Publish listing
      const publishDto = { status: 'published' };

      const publishResponse = await request(app.getHttpServer())
        .patch(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(publishDto)
        .expect(HttpStatus.OK);

      expect(publishResponse.body.status).toBe('published');

      // Step 4: Verify listing appears in user's listings
      const listResponse = await request(app.getHttpServer())
        .get('/listings?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(listResponse.body.listings.some((l: any) => l.id === listingId)).toBe(true);
    });
  });
});
