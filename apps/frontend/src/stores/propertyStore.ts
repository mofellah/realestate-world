// Property and listing store with mock data
import { create } from 'zustand';
import { Property, Listing, SearchFilters } from '../types';
import mockDatabase from '../mocks/mockData';

interface PropertyState {
  properties: Property[];
  listings: Listing[];
  filteredListings: Listing[];
  selectedListing: Listing | null;
  selectedProperty: Property | null;
  filters: SearchFilters;
  isLoading: boolean;
  
  // Actions
  fetchProperties: () => Promise<void>;
  fetchListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  searchNearLocation: (lat: number, lng: number, radius: number) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  listings: [],
  filteredListings: [],
  selectedListing: null,
  selectedProperty: null,
  filters: {},
  isLoading: false,

  fetchProperties: async () => {
    set({ isLoading: true });

    setTimeout(() => {
      set({
        properties: mockDatabase.properties,
        isLoading: false,
      });
    }, 400);
  },

  fetchListings: async () => {
    set({ isLoading: true });
    
    // Mock API call
    setTimeout(() => {
      const publishedListings = mockDatabase.listings.filter(l => l.status === 'published');
      set({ 
        listings: publishedListings,
        filteredListings: publishedListings,
        isLoading: false 
      });
    }, 500);
  },

  fetchListingById: async (id: string) => {
    set({ isLoading: true });
    
    setTimeout(() => {
      const listing = mockDatabase.listings.find(l => l.id === id);
      set({ 
        selectedListing: listing || null,
        selectedProperty: listing?.property || null,
        isLoading: false 
      });
    }, 300);
  },

  fetchPropertyById: async (id: string) => {
    set({ isLoading: true });
    
    setTimeout(() => {
      const property = mockDatabase.properties.find(p => p.id === id);
      set({ 
        selectedProperty: property || null,
        isLoading: false 
      });
    }, 300);
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    set(state => ({ 
      filters: { ...state.filters, ...newFilters } 
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
    get().applyFilters();
  },

  applyFilters: () => {
    const { listings, filters } = get();
    let filtered = [...listings];

    // Apply property type filter
    if (filters.propertyType && filters.propertyType.length > 0) {
      filtered = filtered.filter(l => 
        filters.propertyType!.includes(l.property.propertyType)
      );
    }

    // Apply listing type filter
    if (filters.listingType && filters.listingType.length > 0) {
      filtered = filtered.filter(l => 
        filters.listingType!.includes(l.type)
      );
    }

    // Apply price range filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filtered = filtered.filter(l => {
        const price = l.paymentTerms.termType === 'onetime' 
          ? (l.paymentTerms as any).amount 
          : (l.paymentTerms as any).amountPerPeriod;
        
        if (filters.priceMin !== undefined && price < filters.priceMin) return false;
        if (filters.priceMax !== undefined && price > filters.priceMax) return false;
        return true;
      });
    }

    // Apply bedrooms filter
    if (filters.bedroomsMin !== undefined) {
      filtered = filtered.filter(l => 
        (l.property.bedrooms || 0) >= filters.bedroomsMin!
      );
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(l => 
        l.property.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Apply country filter
    if (filters.country_code) {
      filtered = filtered.filter(l => 
        l.property.address.country_code === filters.country_code
      );
    }

    set({ filteredListings: filtered });
  },

  searchNearLocation: async (lat: number, lng: number, radius: number) => {
    set({ isLoading: true });
    
    setTimeout(() => {
      const { listings } = get();
      
      // Simple distance filter (in real app, use proper geo queries)
      const nearby = listings.filter(l => {
        const propLat = l.property.address.geoObject?.latitude || 0;
        const propLng = l.property.address.geoObject?.longitude || 0;
        
        const distance = Math.sqrt(
          Math.pow(propLat - lat, 2) + Math.pow(propLng - lng, 2)
        );
        
        return distance < radius / 111320; // Rough conversion to degrees
      });
      
      set({ 
        filteredListings: nearby,
        isLoading: false 
      });
    }, 400);
  },
}));
