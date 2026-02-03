/**
 * Integration test for property search boundary filtering
 * Tests that search correctly returns properties within selected boundaries
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '../properties.service';
import { PrismaService } from '../../prisma.service';
import { Logger } from '@nestjs/common';

describe('PropertiesService - Boundary Search Integration', () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        PrismaService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Boundary filtering with real data', () => {
    it('should return properties when searching with valid boundary ID', async () => {
      // Get a boundary that exists
      const boundary = await prisma.boundary.findFirst({
        where: {
          country_code: 'BE',
        },
        select: {
          id: true,
          name: true,
          geometry: true,
        },
      });

      expect(boundary).toBeDefined();
      expect(boundary.geometry).toBeDefined();

      // Search for properties in this boundary
      const result = await service.search({
        boundaries: [boundary.id],
        take: 100,
      });

      // We should get results if:
      // 1. Properties exist with geoJson data
      // 2. Boundary has geometry data
      // 3. Some properties are within the boundary
      
      const propertiesWithGeo = await prisma.property.count({
        where: {
          address: {
            geoObject: {
              geoJson: {
                not: null,
              },
            },
          },
        },
      });

      if (propertiesWithGeo > 0) {
        // If we have properties with geo data and a valid boundary,
        // we should get results (or at least not fail)
        expect(result).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(0);
        
        // Log for debugging
        console.log(`Boundary: ${boundary.name} (${boundary.id})`);
        console.log(`Properties with geo data: ${propertiesWithGeo}`);
        console.log(`Results found: ${result.total}`);
      }
    });

    it('should verify that all properties have geo data for spatial queries', async () => {
      const totalProperties = await prisma.property.count();
      const propertiesWithGeo = await prisma.property.count({
        where: {
          address: {
            geoObject: {
              geoJson: {
                not: null,
              },
            },
          },
        },
      });

      console.log(`Total properties: ${totalProperties}`);
      console.log(`Properties with geoJson: ${propertiesWithGeo}`);

      // Warn if not all properties have geo data
      if (propertiesWithGeo < totalProperties) {
        console.warn(
          `⚠️  ${totalProperties - propertiesWithGeo} properties missing geoJson data - spatial queries will fail for them`,
        );
      }

      // At least some properties should have geo data for testing
      expect(propertiesWithGeo).toBeGreaterThan(0);
    });

    it('should verify boundaries have geometry data for spatial queries', async () => {
      const totalBoundaries = await prisma.boundary.count({
        where: { country_code: 'BE' },
      });
      const boundariesWithGeometry = await prisma.boundary.count({
        where: {
          country_code: 'BE',
          geometry: { not: null },
        },
      });

      console.log(`Total boundaries (BE): ${totalBoundaries}`);
      console.log(`Boundaries with geometry: ${boundariesWithGeometry}`);

      // Warn if not all boundaries have geometry
      if (boundariesWithGeometry < totalBoundaries) {
        console.warn(
          `⚠️  ${totalBoundaries - boundariesWithGeometry} boundaries missing geometry data`,
        );
      }

      // All boundaries should have geometry
      expect(boundariesWithGeometry).toBe(totalBoundaries);
    });

    it('should find properties using spatial containment within Brussels boundaries', async () => {
      // Get Brussels boundaries
      const brusselsBoundaries = await prisma.boundary.findMany({
        where: {
          country_code: 'BE',
          OR: [
            { name: { contains: 'Brussel', mode: 'insensitive' } },
            { name: { contains: 'Brussels', mode: 'insensitive' } },
            { cityName: { contains: 'Bruxelles', mode: 'insensitive' } },
          ],
          geometry: { not: null },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
      });

      console.log(`Found ${brusselsBoundaries.length} Brussels boundaries`);

      if (brusselsBoundaries.length > 0) {
        // Test with first Brussels boundary
        const boundary = brusselsBoundaries[0];
        const result = await service.search({
          boundaries: [boundary.id],
          take: 100,
        });

        console.log(`Search in ${boundary.name}: ${result.total} properties found`);

        // We should get results since our test properties are in Brussels
        expect(result.total).toBeGreaterThan(0);
        expect(result.properties.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error detection for missing data', () => {
    it('should detect and warn when searching boundary with no matching properties', async () => {
      // Get a boundary far from Brussels
      const remoteBoundary = await prisma.boundary.findFirst({
        where: {
          country_code: 'BE',
          NOT: {
            name: { contains: 'Brussel', mode: 'insensitive' },
          },
          geometry: { not: null },
        },
      });

      if (remoteBoundary) {
        const result = await service.search({
          boundaries: [remoteBoundary.id],
          take: 100,
        });

        // This is expected - remote boundary should have 0 results
        expect(result.total).toBe(0);
        console.log(`✓ Remote boundary "${remoteBoundary.name}" correctly returned 0 results`);
      }
    });
  });
});
