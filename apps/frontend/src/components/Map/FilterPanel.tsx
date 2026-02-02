/**
 * PropertyFilters Component
 * Filter panel for property search with spatial filters
 */

import { useState } from "react";

export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  type?: string; // Changed from propertyType to match backend
  bedrooms?: number;
  bathrooms?: number;
  radius?: number; // km for spatial search (ST_DWithin)
  amenities?: string[];
  distanceMetric?: "walking" | "driving" | "direct";
}

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onApply: () => void;
}

export default function FilterPanel({ filters, onChange, onApply }: PropertyFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  const handleChange = (key: keyof PropertyFilters, value: string | number | undefined) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const current = localFilters.amenities || [];
    const updatedAmenities = checked
      ? Array.from(new Set([...current, amenity]))
      : current.filter((item) => item !== amenity);

    const updated = { ...localFilters, amenities: updatedAmenities };
    setLocalFilters(updated);
    onChange(updated);
  };

  const amenityOptions = [
    { id: "schools", label: "Schools" },
    { id: "hospitals", label: "Hospitals" },
    { id: "parks", label: "Parks" },
    { id: "transit", label: "Public Transit" },
    { id: "supermarkets", label: "Supermarkets" },
    { id: "gyms", label: "Gyms" },
    { id: "restaurants", label: "Restaurants" },
  ];

  return (
    <div data-testid="filter-panel" className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            data-testid="price-min-input"
            value={localFilters.priceMin || ""}
            onChange={(e) =>
              handleChange("priceMin", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            data-testid="price-max-input"
            value={localFilters.priceMax || ""}
            onChange={(e) =>
              handleChange("priceMax", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <select
          data-testid="property-type-filter"
          value={localFilters.type || ""}
          onChange={(e) => handleChange("type", e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option data-testid="type-option-house" value="house">
            House
          </option>
          <option data-testid="type-option-apartment" value="apartment">
            Apartment
          </option>
          <option data-testid="type-option-condo" value="condo">
            Condo
          </option>
          <option data-testid="type-option-land" value="land">
            Land
          </option>
          <option data-testid="type-option-commercial" value="commercial">
            Commercial
          </option>
        </select>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
        <select
          data-testid="bedrooms-filter"
          value={localFilters.bedrooms || ""}
          onChange={(e) =>
            handleChange("bedrooms", e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any</option>
          <option data-testid="bedrooms-option-1" value="1">
            1+
          </option>
          <option data-testid="bedrooms-option-2" value="2">
            2+
          </option>
          <option data-testid="bedrooms-option-3" value="3">
            3+
          </option>
          <option data-testid="bedrooms-option-4" value="4">
            4+
          </option>
          <option data-testid="bedrooms-option-5" value="5">
            5+
          </option>
        </select>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
        <select
          data-testid="bathrooms-filter"
          value={localFilters.bathrooms || ""}
          onChange={(e) =>
            handleChange("bathrooms", e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any</option>
          <option data-testid="bathrooms-option-1" value="1">
            1+
          </option>
          <option data-testid="bathrooms-option-2" value="2">
            2+
          </option>
          <option data-testid="bathrooms-option-3" value="3">
            3+
          </option>
        </select>
      </div>

      {/* Proximity Radius (ST_DWithin) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Proximity Radius</label>
        <select
          value={localFilters.radius || ""}
          onChange={(e) =>
            handleChange("radius", e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Entire map</option>
          <option value="1">Within 1 km</option>
          <option value="2">Within 2 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
        </select>
      </div>

      {/* Amenity Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Amenities</label>
        <div className="grid grid-cols-1 gap-2">
          {amenityOptions.map((amenity) => (
            <label key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={localFilters.amenities?.includes(amenity.id) || false}
                onChange={(e) => handleAmenityToggle(amenity.id, e.target.checked)}
              />
              {amenity.label}
            </label>
          ))}
        </div>
      </div>

      {/* Distance Metric */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Distance Type</label>
        <select
          value={localFilters.distanceMetric || "walking"}
          onChange={(e) =>
            handleChange("distanceMetric", e.target.value as PropertyFilters["distanceMetric"])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="walking">Walking distance</option>
          <option value="driving">Driving distance</option>
          <option value="direct">Direct distance</option>
        </select>
      </div>

      {/* Apply Button */}
      <button
        data-testid="filter-apply-button"
        onClick={onApply}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
      >
        Apply Filters
      </button>
    </div>
  );
}
