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
  listings?: Array<{
    id: string;
    type: "sale" | "rental" | "short_term" | "lease";
    status: string;
    publishedAt?: string;
    paymentTerms?: {
      id: string;
      currency: string;
      termType: string;
      onetimePayment?: {
        amount: number;
      };
      periodicPayment?: {
        amountPerPeriod: number;
        periodType: string;
      };
    };
  }>;
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
      // Build request body
      const body: any = {
        take: 100,
      };

      if (filters.priceMin) body.minPrice = filters.priceMin;
      if (filters.priceMax) body.maxPrice = filters.priceMax;
      if (filters.type) body.propertyType = filters.type;
      if (filters.listingType) body.listingType = filters.listingType;
      if (filters.bedrooms) body.minBedrooms = filters.bedrooms;
      if (filters.bathrooms) body.minBathrooms = filters.bathrooms;

      if (filters.amenities && filters.amenities.length > 0) {
        body.amenities = filters.amenities;
      }

      if (filters.boundaries && filters.boundaries.length > 0) {
        body.boundaries = filters.boundaries.map((b) => b.id);
      }

      if (filters.distanceMetric) {
        body.distanceMetric = filters.distanceMetric;
      }

      // Spatial filter (PostGIS ST_DWithin)
      if (filters.radius && center) {
        body.latitude = center[1];
        body.longitude = center[0];
        body.radius = filters.radius * 1000; // km to meters
      }

      const response = await apiClient.post<SearchResult>("/properties/search", body);

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
