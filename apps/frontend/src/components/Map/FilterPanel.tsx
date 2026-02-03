/**
 * PropertyFilters Component
 * Filter panel for property search with spatial filters
 */

import { useState } from "react";
import { BoundarySearch } from "../search/BoundarySearch";
import { BoundarySummary } from "../../services/boundaryService";

export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  type?: string; // Changed from propertyType to match backend
  listingType?: "sale" | "rental" | "short_term" | "lease";
  bedrooms?: number;
  bathrooms?: number;
  radius?: number; // km for spatial search (ST_DWithin)
  amenities?: string[];
  distanceMetric?: "walking" | "driving" | "direct";
  boundaries?: BoundarySummary[];
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

  const handleBoundariesChange = (boundaries: BoundarySummary[]) => {
    const updated = { ...localFilters, boundaries };
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
    { id: "school", label: "Schools" },
    { id: "hospital", label: "Hospitals" },
    { id: "park", label: "Parks" },
    { id: "public_transport", label: "Public Transit" },
    { id: "supermarket", label: "Supermarkets" },
    { id: "gym", label: "Gyms" },
    { id: "restaurant", label: "Restaurants" },
    { id: "shopping", label: "Shopping" },
    { id: "cafe", label: "Cafes" },
    { id: "bank", label: "Banks" },
    { id: "pharmacy", label: "Pharmacies" },
    { id: "library", label: "Libraries" },
    { id: "police", label: "Police Stations" },
    { id: "fire_station", label: "Fire Stations" },
    { id: "gas_station", label: "Gas Stations" },
  ];

  return (
    <div data-testid="filter-panel" className="bg-white p-4 rounded-lg shadow-md">
      {/* Row 1: Listing Type, Location, Price */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
          <select
            data-testid="listing-type-filter"
            value={localFilters.listingType || ""}
            onChange={(e) => handleChange("listingType", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Listings</option>
            <option value="sale">For Sale</option>
            <option value="rental">For Rent</option>
            <option value="short_term">Short Term</option>
            <option value="lease">Lease</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <BoundarySearch
            selectedBoundaries={localFilters.boundaries || []}
            onBoundariesChange={handleBoundariesChange}
            countryCode="BE"
            placeholder="Search cities..."
            maxSelections={10}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price: €{(localFilters.priceMin || 0).toLocaleString()} - €
            {(localFilters.priceMax || 1000000).toLocaleString()}
          </label>
          <div className="space-y-2">
            {/* Dual Range Slider */}
            <div className="relative pt-1 px-2">
              <div className="relative h-2 bg-gray-200 rounded-lg">
                {/* Blue fill between handles */}
                <div
                  className="absolute h-2 bg-blue-600 rounded-lg"
                  style={{
                    left: `${((localFilters.priceMin || 0) / 1000000) * 100}%`,
                    right: `${100 - ((localFilters.priceMax || 1000000) / 1000000) * 100}%`,
                  }}
                />
                {/* Min handle */}
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={localFilters.priceMin || 0}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    const currentMax = localFilters.priceMax || 1000000;
                    if (newMin <= currentMax) {
                      handleChange("priceMin", newMin);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                  style={{
                    zIndex: localFilters.priceMin === localFilters.priceMax ? 5 : 3,
                  }}
                />
                {/* Max handle */}
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={localFilters.priceMax || 1000000}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    const currentMin = localFilters.priceMin || 0;
                    if (newMax >= currentMin) {
                      handleChange("priceMax", newMax);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>
            {/* Number inputs for precise entry */}
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Min"
                data-testid="price-min-input"
                value={localFilters.priceMin || ""}
                onChange={(e) =>
                  handleChange("priceMin", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                data-testid="price-max-input"
                value={localFilters.priceMax || ""}
                onChange={(e) =>
                  handleChange("priceMax", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs"
              />
            </div>
          </div>
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              pointer-events: auto;
              position: relative;
              z-index: 10;
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              pointer-events: auto;
            }
            input[type="range"]::-webkit-slider-runnable-track {
              background: transparent;
            }
            input[type="range"]::-moz-range-track {
              background: transparent;
            }
          `}</style>
        </div>
      </div>

      {/* Row 2: Property Type, Surface, Bedrooms, Bathrooms, Amenities, Proximity */}
      <div className="grid grid-cols-6 gap-4">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
          <select
            data-testid="property-type-filter"
            value={localFilters.type || ""}
            onChange={(e) => handleChange("type", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
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

        {/* Surface */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Surface: {(localFilters.surfaceMin || 0)}m² - {(localFilters.surfaceMax || 500)}m²
          </label>
          <div className="space-y-1">
            {/* Dual Range Slider */}
            <div className="relative pt-1 px-2">
              <div className="relative h-2 bg-gray-200 rounded-lg">
                {/* Blue fill between handles */}
                <div
                  className="absolute h-2 bg-blue-600 rounded-lg"
                  style={{
                    left: `${((localFilters.surfaceMin || 0) / 500) * 100}%`,
                    right: `${100 - ((localFilters.surfaceMax || 500) / 500) * 100}%`,
                  }}
                />
                {/* Min handle */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={localFilters.surfaceMin || 0}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    const currentMax = localFilters.surfaceMax || 500;
                    if (newMin <= currentMax) {
                      handleChange("surfaceMin", newMin);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                  style={{
                    zIndex: localFilters.surfaceMin === localFilters.surfaceMax ? 5 : 3,
                  }}
                />
                {/* Max handle */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={localFilters.surfaceMax || 500}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    const currentMin = localFilters.surfaceMin || 0;
                    if (newMax >= currentMin) {
                      handleChange("surfaceMax", newMax);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beds: {localFilters.bedrooms ? `${localFilters.bedrooms}+` : "Any"}
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={localFilters.bedrooms || 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleChange("bedrooms", val === 0 ? undefined : val);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>6+</span>
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baths: {localFilters.bathrooms ? `${localFilters.bathrooms}+` : "Any"}
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={localFilters.bathrooms || 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleChange("bathrooms", val === 0 ? undefined : val);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>4+</span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
          <select
            multiple
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={localFilters.amenities || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              const updated = { ...localFilters, amenities: selected };
              setLocalFilters(updated);
              onChange(updated);
            }}
          >
            {amenityOptions.map((amenity) => (
              <option key={amenity.id} value={amenity.id}>
                {amenity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Proximity Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proximity</label>
          <select
            value={localFilters.radius || ""}
            onChange={(e) =>
              handleChange("radius", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-4 flex justify-end">
        <button
          data-testid="filter-apply-button"
          onClick={onApply}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
