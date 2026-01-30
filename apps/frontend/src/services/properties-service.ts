/**
 * Properties Service
 * Handles all property-related API calls (search, detail, etc.)
 */

import { apiClient } from './api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchPropertiesParams {
  priceMin?: number;
  priceMax?: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  city?: string;
  country?: string;
  skip?: number;
  take?: number;
}

export interface PropertyDetailResponse {
  id: string;
  type: string;
  address: {
    id: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  listings: Array<{
    id: string;
    type: string;
    status: string;
    paymentTerms: Array<{
      id: string;
      type: string;
      currency: string;
      amount?: number;
      periodType?: string;
      amountPerPeriod?: number;
    }>;
  }>;
  views?: Array<{
    id: string;
    userId: string;
    viewedAt: string;
  }>;
  ownerPerson?: {
    id: string;
    email: string;
    phone?: string;
  };
  user?: {
    id: string;
    email: string;
  };
  agency?: {
    id: string;
    personId: string;
  };
  childProperties?: Array<{
    id: string;
    type: string;
  }>;
  parentPropertyId?: string;
}

export interface PropertySearchResult {
  id: string;
  type: string;
  address: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  listings: Array<{
    type: string;
    paymentTerms: Array<{
      amount?: number;
      currency?: string;
    }>;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

class PropertiesService {
  /**
   * Search properties with filters
   */
  async searchProperties(params: SearchPropertiesParams): Promise<PropertySearchResult[]> {
    const queryString = new URLSearchParams();
    
    if (params.priceMin !== undefined) queryString.append('priceMin', params.priceMin.toString());
    if (params.priceMax !== undefined) queryString.append('priceMax', params.priceMax.toString());
    if (params.type) queryString.append('type', params.type);
    if (params.bedrooms !== undefined) queryString.append('bedrooms', params.bedrooms.toString());
    if (params.bathrooms !== undefined) queryString.append('bathrooms', params.bathrooms.toString());
    if (params.latitude !== undefined) queryString.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryString.append('longitude', params.longitude.toString());
    if (params.radius !== undefined) queryString.append('radius', params.radius.toString());
    if (params.city) queryString.append('city', params.city);
    if (params.country) queryString.append('country', params.country);
    if (params.skip !== undefined) queryString.append('skip', params.skip.toString());
    if (params.take !== undefined) queryString.append('take', params.take.toString());

    const query = queryString.toString();
    const endpoint = query ? `/properties/search?${query}` : '/properties/search';
    
    return apiClient.get<PropertySearchResult[]>(endpoint);
  }

  /**
   * Get property details with full relations
   */
  async getPropertyDetail(id: string): Promise<PropertyDetailResponse> {
    return apiClient.get<PropertyDetailResponse>(`/properties/${id}`);
  }

  /**
   * Get property for editing (used by EditPropertyPage)
   */
  async getProperty(id: string): Promise<any> {
    return apiClient.get(`/properties/${id}`);
  }

  /**
   * Get all properties (with pagination)
   */
  async getAllProperties(skip = 0, take = 20) {
    return apiClient.get(`/properties?skip=${skip}&take=${take}`);
  }

  /**
   * Create property (owner only)
   */
  async createProperty(data: any) {
    return apiClient.post('/properties', data);
  }

  /**
   * Update property (owner only)
   */
  async updateProperty(id: string, data: any) {
    return apiClient.patch(`/properties/${id}`, data);
  }

  /**
   * Delete property (owner only)
   */
  async deleteProperty(id: string) {
    return apiClient.delete(`/properties/${id}`);
  }
}

export const propertiesService = new PropertiesService();
