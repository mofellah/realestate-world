/**
 * Listings Service
 * Handles all listing-related API calls
 */

import { apiClient } from './api-client';

export interface CreateListingDto {
  propertyId: string;
  type: 'sale' | 'rent' | 'airbnb' | 'lease';
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface Listing {
  id: string;
  propertyId: string;
  type: string;
  status: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

class ListingsService {
  /**
   * Create listing
   */
  async createListing(data: CreateListingDto): Promise<Listing> {
    return apiClient.post<Listing>('/listings', data);
  }

  /**
   * Get user's listings
   */
  async getMyListings(): Promise<Listing[]> {
    return apiClient.get<Listing[]>('/listings');
  }

  /**
   * Get single listing
   */
  async getListing(id: string): Promise<Listing> {
    return apiClient.get<Listing>(`/listings/${id}`);
  }

  /**
   * Update listing
   */
  async updateListing(id: string, data: Partial<CreateListingDto>): Promise<Listing> {
    return apiClient.patch<Listing>(`/listings/${id}`, data);
  }

  /**
   * Delete listing
   */
  async deleteListing(id: string): Promise<void> {
    return apiClient.delete(`/listings/${id}`);
  }
}

export const listingsService = new ListingsService();
