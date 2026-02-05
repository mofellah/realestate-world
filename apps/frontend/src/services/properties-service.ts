/**
 * Properties Service
 * Handles all property-related API calls (search, detail, etc.)
 */

import { apiClient } from "./api-client";

// ============================================================================
// TYPES
// ============================================================================

export interface SearchPropertiesParams {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  amenities?: string[];
  distanceMetric?: "walking" | "driving" | "direct";
  boundaries?: string[];
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
    // Clean params - remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined),
    );

    return apiClient.post<PropertySearchResult[]>("/properties/search", cleanParams);
  }

  /**
   * Get property details with full relations
   */
  async getPropertyDetail(id: string): Promise<PropertyDetailResponse> {
    const data = await apiClient.get<PropertyDetailResponse>(`/properties/${id}`);
    return this.transformPropertyDetail(data);
  }

  /**
   * Transform property detail data to remove problematic nested objects
   * Keeps only serializable data needed for rendering
   */
  private transformPropertyDetail(property: any): PropertyDetailResponse {
    return {
      id: property.id,
      title: typeof property.title === "string" ? property.title : undefined,
      description: typeof property.description === "string" ? property.description : undefined,
      type:
        typeof property.type === "string"
          ? property.type
          : typeof property.propertyType === "string"
            ? property.propertyType
            : "property",
      propertyType: typeof property.propertyType === "string" ? property.propertyType : undefined,
      bedrooms: typeof property.bedrooms === "number" ? property.bedrooms : undefined,
      bathrooms: typeof property.bathrooms === "number" ? property.bathrooms : undefined,
      surfaceArea: typeof property.surfaceArea === "number" ? property.surfaceArea : undefined,
      images: Array.isArray(property.images)
        ? property.images.filter((img) => typeof img === "string")
        : [],
      address: {
        id: property.address?.id,
        street: property.address?.streetName || property.address?.street,
        city: property.address?.city,
        state: property.address?.region,
        postalCode: property.address?.postalCode,
        country: property.address?.country_code || property.address?.country,
        latitude: property.address?.geoObject?.latitude,
        longitude: property.address?.geoObject?.longitude,
      },
      listings: Array.isArray(property.listings)
        ? property.listings.map((listing: any) => ({
            id: listing.id,
            type: listing.type,
            status: listing.status,
            paymentTerms: listing.paymentTerms
              ? [
                  {
                    id: listing.paymentTerms.id,
                    type: listing.paymentTerms.type,
                    termType: listing.paymentTerms.termType,
                    currency: listing.paymentTerms.currency,
                    // Extract only scalar values from nested payment objects
                    amount:
                      typeof listing.paymentTerms.onetimePayment?.amount === "number"
                        ? listing.paymentTerms.onetimePayment.amount
                        : undefined,
                    amountPerPeriod:
                      typeof listing.paymentTerms.periodicPayment?.amountPerPeriod === "number"
                        ? listing.paymentTerms.periodicPayment.amountPerPeriod
                        : undefined,
                  },
                ]
              : [],
          }))
        : [],
      views: Array.isArray(property.listings?.[0]?.views)
        ? property.listings[0].views.map((view: any) => ({
            id: view.id,
            userId: view.userId || view.user?.id,
            viewedAt: view.timestamp || view.viewedAt,
          }))
        : [],
      ownerPerson: property.ownerPerson
        ? {
            id: property.ownerPerson.id,
            email:
              typeof property.ownerPerson.email === "string"
                ? property.ownerPerson.email
                : typeof property.ownerPerson.physicalPerson?.email === "string"
                  ? property.ownerPerson.physicalPerson.email
                  : undefined,
            phone:
              typeof property.ownerPerson.phone === "string"
                ? property.ownerPerson.phone
                : undefined,
          }
        : undefined,
      user: property.user
        ? {
            id: typeof property.user.id === "string" ? property.user.id : undefined,
            email: typeof property.user.email === "string" ? property.user.email : undefined,
          }
        : undefined,
      agency: property.ownerPerson?.agency
        ? {
            id:
              typeof property.ownerPerson.agency.id === "string"
                ? property.ownerPerson.agency.id
                : undefined,
            personId:
              typeof property.ownerPerson.agency.personId === "string"
                ? property.ownerPerson.agency.personId
                : undefined,
          }
        : undefined,
    } as PropertyDetailResponse;
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
    return apiClient.post("/properties", data);
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

  /**
   * Contact property owner
   */
  async contactOwner(id: string, data: { subjectLine: string; body: string }) {
    return apiClient.post(`/properties/${id}/contact`, data);
  }
}

export const propertiesService = new PropertiesService();
