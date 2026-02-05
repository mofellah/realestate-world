/**
 * Neighborhood API Service
 * Client-side service for neighborhood search endpoints
 */

import axios from "axios";

// Use environment variable with fallback for tests
const getApiBase = (): string => {
  // In browser with Vite
  if (typeof window !== "undefined" && (window as any).__VITE_API_BASE_URL__) {
    return (window as any).__VITE_API_BASE_URL__;
  }
  // In Node.js (tests)
  return process.env.VITE_API_BASE_URL || "http://localhost:3000";
};

const API_BASE = getApiBase();

export interface NeighborhoodSummary {
  id: string;
  name: string;
  nameSlug: string;
  cityName: string;
  regionName?: string | null;
  country_code: string;
  propertyCount: number;
  avgPrice?: number | null;
  centroidLat?: number | null;
  centroidLon?: number | null;
}

export interface AutocompleteParams {
  query: string;
  country_code?: string;
  limit?: number;
}

export interface SearchParams {
  name?: string;
  cityName?: string;
  country_code?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface BoundingBoxParams {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  limit?: number;
}

export class NeighborhoodService {
  /**
   * Autocomplete search for neighborhoods
   */
  static async autocomplete(params: AutocompleteParams): Promise<NeighborhoodSummary[]> {
    const response = await axios.get(`${API_BASE}/neighborhoods/autocomplete`, { params });
    return response.data;
  }

  /**
   * Search neighborhoods with filters
   */
  static async search(params: SearchParams): Promise<NeighborhoodSummary[]> {
    const response = await axios.get(`${API_BASE}/neighborhoods/search`, { params });
    return response.data;
  }

  /**
   * Get popular/featured neighborhoods
   */
  static async getPopular(country_code?: string, limit?: number): Promise<NeighborhoodSummary[]> {
    const response = await axios.get(`${API_BASE}/neighborhoods/popular`, {
      params: { country_code, limit },
    });
    return response.data;
  }

  /**
   * Get neighborhoods in map bounding box
   */
  static async getBoundingBox(params: BoundingBoxParams): Promise<NeighborhoodSummary[]> {
    const response = await axios.get(`${API_BASE}/neighborhoods/bbox`, { params });
    return response.data;
  }

  /**
   * Get neighborhood by ID
   */
  static async getById(id: string): Promise<NeighborhoodSummary> {
    const response = await axios.get(`${API_BASE}/neighborhoods/${id}`);
    return response.data;
  }

  /**
   * Get neighborhood by slug (for SEO URLs)
   */
  static async getBySlug(
    country_code: string,
    cityName: string,
    nameSlug: string,
  ): Promise<NeighborhoodSummary> {
    const response = await axios.get(
      `${API_BASE}/neighborhoods/slug/${country_code}/${encodeURIComponent(cityName)}/${nameSlug}`,
    );
    return response.data;
  }
}
