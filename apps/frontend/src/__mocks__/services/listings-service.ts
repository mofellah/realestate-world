/**
 * Mock Listings Service
 * Provides mock implementations of listing CRUD methods for testing
 */

import type { Listing } from '@boilerplate/types';

const defaultListing: Listing = {
  id: 'listing-1',
  propertyId: 'prop-1',
  title: 'Test Listing',
  description: 'A test listing',
  listingType: 'sale',
  price: 500000,
  currency: 'USD',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const listingsService = {
  createListing: jest.fn().mockResolvedValue(defaultListing),
  getMyListings: jest.fn().mockResolvedValue([defaultListing]),
  getListing: jest.fn().mockResolvedValue(defaultListing),
  updateListing: jest.fn().mockResolvedValue(defaultListing),
  deleteListing: jest.fn().mockResolvedValue(undefined),
};

export default listingsService;
