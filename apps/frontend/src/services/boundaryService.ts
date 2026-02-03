/**
 * Boundary API Service
 * Handles API calls for administrative boundaries (cities, regions, municipalities)
 */

import axios from "axios";

// Use /api proxy in browser, full URL in tests
const isNode = typeof window === "undefined";
const API_BASE_URL = isNode ? process.env.VITE_API_URL || "http://localhost:3000/api" : "/api";

export interface BoundaryType {
  code: string;
  name: string;
  localName: string | null;
  level: number;
}

export interface BoundarySummary {
  id: string;
  name: string;
  nameSlug: string;
  boundaryType: BoundaryType;
  country_code: string;
  population: number | null;
  area_sqkm: number | null;
  centroidLat: number | null;
  centroidLon: number | null;
  isPopular: boolean;
  searchRank: number;
}

export interface AutocompleteBoundariesParams {
  query: string;
  country_code?: string;
  typeCode?: string;
  limit?: number;
}

export interface SearchBoundariesParams {
  name?: string;
  typeCode?: string;
  country_code?: string;
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
  lat?: number;
  lon?: number;
  radius?: number;
  limit?: number;
}

export class BoundaryService {
  /**
   * Autocomplete search for boundaries
   */
  static async autocomplete(params: AutocompleteBoundariesParams): Promise<BoundarySummary[]> {
    const response = await axios.get(`${API_BASE_URL}/boundaries/autocomplete`, { params });
    return response.data;
  }

  /**
   * Search boundaries with filters (uses POST for complex queries)
   */
  static async search(params: SearchBoundariesParams): Promise<BoundarySummary[]> {
    const response = await axios.post(`${API_BASE_URL}/boundaries/search`, params);
    return response.data;
  }

  /**
   * Get popular boundaries
   */
  static async getPopular(country_code?: string, limit = 20): Promise<BoundarySummary[]> {
    const response = await axios.get(`${API_BASE_URL}/boundaries/popular`, {
      params: { country_code, limit },
    });
    return response.data;
  }

  /**
   * Get boundary by ID
   */
  static async getById(id: string): Promise<BoundarySummary> {
    const response = await axios.get(`${API_BASE_URL}/boundaries/${id}`);
    return response.data;
  }

  /**
   * Format boundary for display (e.g., "New York, State" or "Brussels, Municipality")
   */
  static formatBoundaryDisplay(boundary: BoundarySummary): string {
    const typeName = boundary.boundaryType.localName || boundary.boundaryType.name;
    // Capitalize first letter of type name
    const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    return `${boundary.name}, ${capitalizedType}`;
  }
}
