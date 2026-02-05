/**
 * PropertyFilters Component - Redesigned with Vizzit UX Strategy
 * Primary bar for critical filters (Location, Listing Type, Property Type, Budget)
 * Advanced panel for secondary filters (Surface, Rooms, etc.)
 */

import { useEffect, useState } from "react";
import { BoundarySearch } from "../search/BoundarySearch";
import { BoundarySummary } from "../../services/boundaryService";

export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  habitableSurfaceMin?: number;
  habitableSurfaceMax?: number;
  landSurfaceMin?: number;
  landSurfaceMax?: number;
  type?: string;
  listingType?: "sale" | "rental" | "short_term" | "lease";
  bedrooms?: number;
  bathrooms?: number;
  minRooms?: number;
  purchaseType?: "all" | "old" | "new";
  sellerType?: "all" | "individual" | "agency";
  publicationDate?: "last_48h" | "last_week" | "last_month";
  floorPreference?: "ground_floor" | "no_ground_floor" | "top_floor";
  radius?: number;
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showSurfaceDropdown, setShowSurfaceDropdown] = useState(false);
  const [showRoomsDropdown, setShowRoomsDropdown] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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

  const handleReset = () => {
    const cleared: PropertyFilters = {};
    setLocalFilters(cleared);
    onChange(cleared);
  };

  // Helper to count active advanced filters
  const countAdvancedFilters = () => {
    let count = 0;
    if (localFilters.purchaseType && localFilters.purchaseType !== "all") count++;
    if (localFilters.sellerType && localFilters.sellerType !== "all") count++;
    if (localFilters.publicationDate) count++;
    if (localFilters.floorPreference) count++;
    if (localFilters.amenities && localFilters.amenities.length > 0)
      count += localFilters.amenities.length;
    return count;
  };

  return (
    <div data-testid="filter-panel" className="space-y-3">
      {/* PRIMARY FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Location Search - flex-grow */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
          <BoundarySearch
            selectedBoundaries={localFilters.boundaries || []}
            onBoundariesChange={handleBoundariesChange}
            countryCode="BE"
            placeholder="City, postal code..."
            maxSelections={10}
          />
        </div>

        {/* Listing Type */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Listing</label>
          <select
            data-testid="listing-type-filter"
            value={localFilters.listingType || ""}
            onChange={(e) => handleChange("listingType", e.target.value || undefined)}
            className="w-full lg:w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 hover:border-gray-300 cursor-pointer"
          >
            <option value="">All</option>
            <option value="sale">Sale</option>
            <option value="rental">Rent</option>
            <option value="short_term">Short</option>
            <option value="lease">Lease</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
          <select
            data-testid="property-type-filter"
            value={localFilters.type || ""}
            onChange={(e) => handleChange("type", e.target.value || undefined)}
            className="w-full lg:w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 hover:border-gray-300 cursor-pointer"
          >
            <option value="">All</option>
            <option data-testid="type-option-house" value="house">
              House
            </option>
            <option data-testid="type-option-apartment" value="apartment">
              Apt
            </option>
            <option data-testid="type-option-land" value="land">
              Land
            </option>
            <option data-testid="type-option-commercial" value="commercial">
              Comm
            </option>
          </select>
        </div>

        {/* Budget Dropdown Button */}
        <div className="flex-shrink-0 relative">
          {/* <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget</label> */}
          <button
            type="button"
            onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
            className="w-full lg:w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 hover:border-blue-300 text-left flex items-center justify-between transition"
          >
            <span className="truncate">
              {localFilters.priceMin ? `€${(localFilters.priceMin / 1000).toFixed(0)}k` : "Budget"}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>

          {/* Budget Inline Dropdown */}
          {showBudgetDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                <select
                  data-testid="price-min-input"
                  value={localFilters.priceMin ?? ""}
                  onChange={(e) =>
                    handleChange("priceMin", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                >
                  <option value="">No min</option>
                  {[50000, 100000, 150000, 200000, 300000, 400000, 500000, 750000, 1000000].map(
                    (value) => (
                      <option key={value} value={value}>
                        €{value.toLocaleString()}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                <select
                  data-testid="price-max-input"
                  value={localFilters.priceMax ?? ""}
                  onChange={(e) =>
                    handleChange("priceMax", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                >
                  <option value="">No max</option>
                  {[100000, 150000, 200000, 300000, 400000, 500000, 750000, 1000000, 1500000].map(
                    (value) => (
                      <option key={value} value={value}>
                        €{value.toLocaleString()}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetDropdown(false)}
                className="w-full px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Surface Dropdown Button */}
        <div className="flex-shrink-0 relative">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Surface</label>
          <button
            type="button"
            onClick={() => setShowSurfaceDropdown(!showSurfaceDropdown)}
            className="w-full lg:w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 hover:border-blue-300 text-left flex items-center justify-between transition"
          >
            <span className="truncate">
              {localFilters.habitableSurfaceMin ? `${localFilters.habitableSurfaceMin}m²` : "Any"}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>

          {/* Surface Inline Dropdown */}
          {showSurfaceDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Habitable (m²)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.habitableSurfaceMin ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "habitableSurfaceMin",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.habitableSurfaceMax ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "habitableSurfaceMax",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Land (m²)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.landSurfaceMin ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "landSurfaceMin",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.landSurfaceMax ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "landSurfaceMax",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSurfaceDropdown(false)}
                className="w-full px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Rooms Dropdown Button */}
        <div className="flex-shrink-0 relative">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rooms</label>
          <button
            type="button"
            onClick={() => setShowRoomsDropdown(!showRoomsDropdown)}
            className="w-full lg:w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 hover:border-blue-300 text-left flex items-center justify-between transition"
          >
            <span className="truncate">
              {localFilters.bedrooms ? `${localFilters.bedrooms}+ bed` : "Any"}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>

          {/* Rooms Inline Dropdown */}
          {showRoomsDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Rooms</label>
                <div className="flex gap-1">
                  {["Studio", "2", "3", "4", "5+"].map((val, idx) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChange("minRooms", idx === 0 ? 0 : idx + 1)}
                      className={`flex-1 px-1.5 py-1 rounded text-xs font-medium border transition ${
                        localFilters.minRooms === (idx === 0 ? 0 : idx + 1)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Bedrooms</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChange("bedrooms", val)}
                      className={`flex-1 px-1.5 py-1 rounded text-xs font-medium border transition ${
                        localFilters.bedrooms === val
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {val}+
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Bathrooms</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChange("bathrooms", val)}
                      className={`flex-1 px-1.5 py-1 rounded text-xs font-medium border transition ${
                        localFilters.bathrooms === val
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {val}+
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoomsDropdown(false)}
                className="w-full px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* More Filters Button */}
        <div className="flex-shrink-0 flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full lg:w-auto px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <span>+</span>
            {countAdvancedFilters() > 0 && (
              <span className="ml-1 inline-flex items-center justify-center bg-blue-600 text-white text-xs rounded-full w-5 h-5">
                {Math.min(countAdvancedFilters(), 9)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="hidden lg:inline-flex px-3 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ACTIVE FILTERS CHIPS */}
      {Object.keys(localFilters).some((key) => {
        const val = localFilters[key as keyof PropertyFilters];
        return (
          val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : val !== "")
        );
      }) && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          {localFilters.boundaries && localFilters.boundaries.length > 0 && (
            <>
              {localFilters.boundaries.slice(0, 2).map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {b.name}
                  <button
                    onClick={() =>
                      handleBoundariesChange(localFilters.boundaries!.filter((x) => x.id !== b.id))
                    }
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {localFilters.boundaries.length > 2 && (
                <span className="text-gray-500 text-xs">+{localFilters.boundaries.length - 2}</span>
              )}
            </>
          )}
          {localFilters.listingType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {localFilters.listingType}
              <button
                onClick={() => handleChange("listingType", undefined)}
                className="ml-1 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </span>
          )}
          {localFilters.type && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {localFilters.type}
              <button
                onClick={() => handleChange("type", undefined)}
                className="ml-1 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </span>
          )}
          {(localFilters.priceMin || localFilters.priceMax) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              €{(localFilters.priceMin || 0).toLocaleString()} - €
              {(localFilters.priceMax || 0).toLocaleString()}
              <button
                onClick={() => {
                  handleChange("priceMin", undefined);
                  handleChange("priceMax", undefined);
                }}
                className="ml-1 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </span>
          )}
          {localFilters.bedrooms && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {localFilters.bedrooms}+ bed
              <button
                onClick={() => handleChange("bedrooms", undefined)}
                className="ml-1 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* ADVANCED FILTERS PANEL - Only truly advanced filters */}
      {showAdvanced && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-4 shadow-sm max-h-96 overflow-y-auto">
          {/* Purchase & Seller Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Listing Details</h3>

            {/* Purchase Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Purchase Type
              </label>
              <div className="flex gap-2">
                {["all", "old", "new"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange("purchaseType", val as "all" | "old" | "new")}
                    className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium border transition ${
                      (localFilters.purchaseType || "all") === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {val === "all" ? "All" : val === "old" ? "Old" : "New"}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Seller Type</label>
              <div className="flex gap-2">
                {["all", "individual", "agency"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      handleChange("sellerType", val as "all" | "individual" | "agency")
                    }
                    className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium border transition ${
                      (localFilters.sellerType || "all") === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {val === "all" ? "All" : val === "individual" ? "Individual" : "Agency"}
                  </button>
                ))}
              </div>
            </div>

            {/* Publication Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Publication Date
              </label>
              <div className="flex gap-2">
                {[
                  { val: "last_48h", label: "Last 48h" },
                  { val: "last_week", label: "Last week" },
                  { val: "last_month", label: "Last month" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      handleChange(
                        "publicationDate",
                        val as "last_48h" | "last_week" | "last_month",
                      )
                    }
                    className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium border transition ${
                      localFilters.publicationDate === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Preference */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Floor Preference
              </label>
              <div className="flex gap-2">
                {[
                  { val: "ground_floor", label: "Ground" },
                  { val: "no_ground_floor", label: "Not ground" },
                  { val: "top_floor", label: "Top" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      handleChange(
                        "floorPreference",
                        val as "ground_floor" | "no_ground_floor" | "top_floor",
                      )
                    }
                    className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium border transition ${
                      localFilters.floorPreference === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => {
                const active = (localFilters.amenities || []).includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id, !active)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdvanced(false);
                onApply();
              }}
              data-testid="filter-apply-button"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
