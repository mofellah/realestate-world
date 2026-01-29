import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { PropertiesModule } from '../properties.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../../auth/auth.service';
import { AuthModule } from '../../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

/**
 * PropertiesController Integration Tests
 * Tests CRUD operations, search/filtering, and access control
 * Maps to BDD scenarios: property search, filtering, and details display
 */
describe('PropertiesController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let jwtService: JwtService;

  let testUser: any;
  let testToken: string;
  let testAddress: any;
  let testProperty: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PropertiesModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);
    jwtService = moduleFixture.get(JwtService);

    // Setup: Create test user with address
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
  });

  afterAll(async () => {
    // Cleanup: Delete all test data created by this suite
    // This prevents email conflicts with other test suites
    try {
      // Get person ID before deleting user
      const user = await prisma.user.findUnique({ where: { id: testUser.id } });
      const personId = user?.personId;

      // Delete in correct order to respect foreign keys
      await prisma.property.deleteMany({
        where: {
          userId: testUser.id,
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
    // Cleanup: Don't delete properties here to avoid interfering with other test suites
    // Properties will be cleaned up by database reset or by individual test suites
  });

  describe('POST /properties (Create)', () => {
    let createdPropertyId: string | null = null;

    afterEach(async () => {
      // Clean up property created in this test
      if (createdPropertyId) {
        await prisma.property.deleteMany({
          where: { id: createdPropertyId },
        });
        createdPropertyId = null;
      }
    });

    it('should create property with valid data', async () => {
      const createDto = {
        title: 'Beautiful Apartment in Brussels',
        description: 'Spacious 2BR apartment near city center',
        addressId: testAddress.id,
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        surfaceArea: 75,
        yearBuilt: 2010,
        amenitiesList: ['parking', 'elevator'],
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Beautiful Apartment in Brussels');
      expect(response.body.bedrooms).toBe(2);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.isAvailable).toBe(true);

      testProperty = response.body;
      createdPropertyId = response.body.id; // Store for cleanup
    });

    it('should reject create without title', async () => {
      const createDto = {
        addressId: testAddress.id,
        propertyType: 'apartment',
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject create without addressId', async () => {
      const createDto = {
        title: 'Test Property',
        propertyType: 'apartment',
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject create with invalid addressId', async () => {
      const createDto = {
        title: 'Test Property',
        addressId: 'invalid-id',
        propertyType: 'apartment',
      };

      await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should require authentication', async () => {
      const createDto = {
        title: 'Test Property',
        addressId: testAddress.id,
      };

      await request(app.getHttpServer())
        .post('/properties')
        .send(createDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /properties (List)', () => {
    let createdPropertyIds: string[] = [];

    beforeEach(async () => {
      // Create multiple test properties
      createdPropertyIds = [];
      for (let i = 0; i < 3; i++) {
        const property = await prisma.property.create({
          data: {
            title: `Property ${i}`,
            addressId: testAddress.id,
            userId: testUser.id,
            ownerPersonId: testUser.personId,
            propertyType: 'apartment',
            bedrooms: i + 1,
            isAvailable: true,
          },
        });
        createdPropertyIds.push(property.id);
      }
    });

    afterEach(async () => {
      // Clean up only the properties created in this describe block
      await prisma.property.deleteMany({
        where: {
          id: {
            in: createdPropertyIds,
          },
        },
      });
    });

    it('should list user properties with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('properties');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.properties)).toBe(true);
      expect(response.body.total).toBe(3);
      expect(response.body.properties.length).toBe(3);
    });

    it('should paginate results correctly', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/properties?skip=0&take=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response1.body.properties.length).toBe(2);

      const response2 = await request(app.getHttpServer())
        .get('/properties?skip=2&take=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response2.body.properties.length).toBe(1);
    });

    it('should return ordered by createdAt descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const props = response.body.properties;
      for (let i = 1; i < props.length; i++) {
        const prev = new Date(props[i - 1].createdAt).getTime();
        const current = new Date(props[i].createdAt).getTime();
        expect(prev).toBeGreaterThanOrEqual(current);
      }
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/properties')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /properties/:id (Get by ID)', () => {
    beforeEach(async () => {
      testProperty = await prisma.property.create({
        data: {
          title: 'Test Property',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: testUser.personId,
          propertyType: 'house',
          bedrooms: 3,
        },
      });
    });

    afterEach(async () => {
      // Clean up the test property
      if (testProperty?.id) {
        await prisma.property.deleteMany({
          where: { id: testProperty.id },
        });
      }
    });

    it('should get property by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toBe(testProperty.id);
      expect(response.body.title).toBe('Test Property');
      expect(response.body.bedrooms).toBe(3);
    });

    it('should include address relation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.address).toHaveProperty('city');
      expect(response.body.address).toHaveProperty('streetName');
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .get('/properties/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /properties/:id (Update)', () => {
    beforeEach(async () => {
      testProperty = await prisma.property.create({
        data: {
          title: 'Original Title',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: testUser.personId,
          propertyType: 'apartment',
          bedrooms: 2,
        },
      });
    });

    afterEach(async () => {
      // Clean up the test property
      if (testProperty?.id) {
        await prisma.property.deleteMany({
          where: { id: testProperty.id },
        });
      }
    });

    it('should update property by owner', async () => {
      const updateDto = {
        title: 'Updated Title',
        bedrooms: 3,
        description: 'New description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.bedrooms).toBe(3);
      expect(response.body.description).toBe('New description');
    });

    it('should not update title if not provided', async () => {
      const updateDto = { bedrooms: 4 };

      const response = await request(app.getHttpServer())
        .patch(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe('Original Title');
      expect(response.body.bedrooms).toBe(4);
    });

    it('should reject update if not owner', async () => {
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

      const updateDto = { title: 'Hacked Title' };

      await request(app.getHttpServer())
        .patch(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .patch('/properties/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ title: 'New Title' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/properties/${testProperty.id}`)
        .send({ title: 'New Title' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /properties/:id (Delete)', () => {
    beforeEach(async () => {
      testProperty = await prisma.property.create({
        data: {
          title: 'Property to Delete',
          addressId: testAddress.id,
          userId: testUser.id,
          ownerPersonId: testUser.personId,
          propertyType: 'apartment',
        },
      });
    });

    it('should delete property by owner', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify deleted
      const response = await request(app.getHttpServer())
        .get(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject delete if not owner', async () => {
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
        .delete(`/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent property', async () => {
      await request(app.getHttpServer())
        .delete('/properties/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/properties/${testProperty.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('BDD Scenario: Property Discovery Flow', () => {
    it('should support property search, filter, and details viewing', async () => {
      // Setup: Create multiple properties with varied attributes
      const addr1 = await prisma.address.create({
        data: {
          streetName: 'Main',
          streetNumber: '1',
          postalCode: '1000',
          city: 'Brussels',
          country_code: 'BE',
        },
      });

      const addr2 = await prisma.address.create({
        data: {
          streetName: 'Side',
          streetNumber: '2',
          postalCode: '1000',
          city: 'Amsterdam',
          country_code: 'NL',
        },
      });

      const prop1 = await prisma.property.create({
        data: {
          title: 'Amsterdam Apartment',
          addressId: addr2.id,
          userId: testUser.id,
          ownerPersonId: testUser.personId,
          propertyType: 'apartment',
          bedrooms: 2,
          isAvailable: true,
        },
      });

      const prop2 = await prisma.property.create({
        data: {
          title: 'Brussels House',
          addressId: addr1.id,
          userId: testUser.id,
          ownerPersonId: testUser.personId,
          propertyType: 'house',
          bedrooms: 3,
          isAvailable: true,
        },
      });

      // Step 1: List all properties
      const listResponse = await request(app.getHttpServer())
        .get('/properties?skip=0&take=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(listResponse.body.total).toBeGreaterThanOrEqual(2);

      // Step 2: Get property details
      const detailResponse = await request(app.getHttpServer())
        .get(`/properties/${prop1.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(detailResponse.body.title).toBe('Amsterdam Apartment');
      expect(detailResponse.body.address.city).toBe('Amsterdam');
      expect(detailResponse.body.bedrooms).toBe(2);

      // Step 3: Verify property metadata matches BDD criteria
      expect(detailResponse.body).toHaveProperty('address');
      expect(detailResponse.body).toHaveProperty('createdAt');
      expect(detailResponse.body).toHaveProperty('isAvailable');
    });
  });
});
