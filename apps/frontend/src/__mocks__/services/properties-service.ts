/**
 * Mock Properties Service
 * Provides mock implementations of property CRUD methods for testing
 */

import type { Property } from '@boilerplate/types';

const defaultProperty: Property = {
  id: 'prop-1',
  title: 'Test Property',
  description: 'A test property',
  propertyType: 'apartment',
  address: '123 Test St',
  city: 'Test City',
  state: 'TC',
  zipCode: '12345',
  bedrooms: 2,
  bathrooms: 1.5,
  squareFeet: 1000,
  yearBuilt: 2020,
  price: 500000,
  ownerId: 'owner-1',
  geoObjectId: 'geo-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const propertiesService = {
  getProperty: jest.fn().mockResolvedValue(defaultProperty),
  getAllProperties: jest.fn().mockResolvedValue([defaultProperty]),
  createProperty: jest.fn().mockResolvedValue(defaultProperty),
  updateProperty: jest.fn().mockResolvedValue(defaultProperty),
  deleteProperty: jest.fn().mockResolvedValue(undefined),
};

export default propertiesService;
