/**
 * useMapSearch Hook
 * Spatial property search with PostGIS queries
 */

import { useState, useCallback } from "react";
import { apiClient } from "@/services/api-client";
import type { PropertyFilters } from "@/components/Map/FilterPanel";

interface Property {
  id: string;
  title: string;
  description?: string;
  address:
    | {
        latitude?: number;
        longitude?: number;
        street?: string;
        streetName?: string;
        city: string;
        country_code?: string;
      }
    | string; // Can be string or object
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  areaSquareMeters?: number;
  price?: number;
}

interface SearchResult {
  properties: Property[];
  total: number;
}

export function useMapSearch() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (filters: PropertyFilters, center?: [number, number]) => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();

      if (filters.priceMin) params.append("priceMin", filters.priceMin.toString());
      if (filters.priceMax) params.append("priceMax", filters.priceMax.toString());
      if (filters.propertyType) params.append("type", filters.propertyType);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms.toString());
      if (filters.bathrooms) params.append("bathrooms", filters.bathrooms.toString());

      // Spatial filter (PostGIS ST_DWithin)
      if (filters.radius && center) {
        params.append("latitude", center[1].toString());
        params.append("longitude", center[0].toString());
        params.append("radius", (filters.radius * 1000).toString()); // km to meters
      }

      const url = `/properties/search?${params.toString()}`;
      console.log("[useMapSearch] Fetching from:", url);

      const response = await apiClient.get<SearchResult>(url);

      console.log("[useMapSearch] Response received:", response);

      setProperties(response.properties);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      console.error("[useMapSearch] Error:", errorMessage);
      setError(errorMessage);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProperties([]);
    setTotal(0);
    setError(null);
  }, []);

  return {
    properties,
    total,
    loading,
    error,
    search,
    reset,
  };
}
