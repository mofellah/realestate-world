import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MapView from "@/components/Map/MapView";
import FilterPanel, { PropertyFilters } from "@/components/Map/FilterPanel";
import { useMapSearch } from "@/hooks/useMapSearch";
import { PropertyCardSkeleton } from "@/components/Skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function SearchPage() {
  const navigate = useNavigate();
  const { properties, total, loading, search, error } = useMapSearch();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [showList, setShowList] = useState<boolean>(true);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [center] = useState<[number, number]>([4.3517, 50.8503]); // Brussels
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  // Helper function to format price
  const formatPrice = (property: any) => {
    if (!property.listings || property.listings.length === 0) {
      return "Price on request";
    }

    const listing = property.listings[0];
    const paymentTerms = listing.paymentTerms;

    if (!paymentTerms) {
      return "Price on request";
    }

    const currency = paymentTerms.currency || "EUR";
    const currencySymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;

    // For sale listings (onetime payment)
    if (paymentTerms.onetimePayment?.amount) {
      const amount = paymentTerms.onetimePayment.amount;
      return `${amount.toLocaleString("en-US")} ${currencySymbol}`;
    }

    // For rental/lease listings (periodic payment)
    if (paymentTerms.periodicPayment?.amountPerPeriod) {
      const amount = paymentTerms.periodicPayment.amountPerPeriod;
      const period = paymentTerms.periodicPayment.periodType || "month";
      return `${amount.toLocaleString("en-US")} ${currencySymbol} / ${period}`;
    }

    return "Price on request";
  };

  useEffect(() => {
    // Initial search - run only once on mount
    search(filters, center);
  }, []);

  useEffect(() => {
    // Properties loaded and updated
  }, [properties, total]);

  const handleApplyFilters = () => {
    search(filters, center);

    // Update URL with filter params for shareable links
    const params = new URLSearchParams();
    if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
    if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
    if (filters.type) params.set("type", filters.type);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms.toString());
    if (filters.radius) params.set("radius", filters.radius.toString());
    if (filters.distanceMetric) params.set("distanceMetric", filters.distanceMetric);
    if (filters.amenities && filters.amenities.length > 0)
      params.set("amenities", filters.amenities.join(","));

    window.history.pushState({}, "", `?${params.toString()}`);
  };

  const handlePropertyClick = (property: any) => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div data-testid="search-page" className="h-screen flex flex-col bg-gray-50">
      {/* Header with Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Search Properties</h1>
              <p className="text-gray-600 text-sm">{total} properties found</p>
            </div>
            <div className="flex space-x-2">
              <button
                data-testid="filter-toggle"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterPanelOpen
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {filterPanelOpen ? "Hide" : "Show"} Filters
              </button>
              <button
                data-testid="view-toggle-list"
                onClick={() => setShowList(!showList)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  showList
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                📋 {showList ? "Hide" : "Show"} List
              </button>
              <button
                data-testid="view-toggle-map"
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  showMap
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                🗺️ {showMap ? "Hide" : "Show"} Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {filterPanelOpen && (
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <FilterPanel filters={filters} onChange={setFilters} onApply={handleApplyFilters} />
          </div>
        </div>
      )}

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Section */}
        {showList && (
          <div
            className={`${
              showMap ? "w-1/2" : "w-full"
            } overflow-y-auto bg-gray-50 border-r border-gray-200`}
          >
            <div className="container mx-auto px-4 py-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 font-semibold">Search Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {loading && (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {!loading && (
                <ErrorBoundary
                  fallback={() => (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2">Failed to load properties</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:underline"
                      >
                        Reload page
                      </button>
                    </div>
                  )}
                >
                  <div data-testid="listing-grid" className="grid grid-cols-1 gap-6">
                    {properties.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No properties found. Try adjusting your filters.
                      </div>
                    ) : (
                      properties.map((property) => (
                        <Link
                          key={property.id}
                          to={`/property/${property.id}`}
                          data-testid="listing-card"
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex"
                        >
                          <div className="w-48 h-48 bg-gray-200 flex-shrink-0">
                            <div className="h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                            <p
                              data-testid="property-type"
                              className="text-gray-500 text-xs uppercase mb-1"
                            >
                              {property.propertyType || "Property"}
                            </p>
                            <p data-testid="property-address" className="text-gray-600 text-sm mb-2">
                              {typeof property.address === "string"
                                ? property.address
                                : property.address?.city || "No location"}
                            </p>
                            <p
                              data-testid="property-price"
                              className="text-xl font-bold text-blue-600 mb-2"
                            >
                              {formatPrice(property)}
                            </p>
                            <div className="flex space-x-4 text-sm text-gray-500">
                              {property.bedrooms && (
                                <span data-testid="property-bedrooms">🛏️ {property.bedrooms}</span>
                              )}
                              {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                              {property.surfaceArea && <span>📏 {property.surfaceArea}m²</span>}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </ErrorBoundary>
              )}
            </div>
          </div>
        )}

        {/* Map Section */}
        {showMap && (
          <div className={`${showList ? "w-1/2" : "w-full"} relative`}>
            <ErrorBoundary
              fallback={() => (
                <div className="h-full flex items-center justify-center bg-white">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Map failed to load</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-blue-600 hover:underline"
                    >
                      Reload page
                    </button>
                  </div>
                </div>
              )}
            >
              <MapView
                properties={properties}
                center={center}
                zoom={12}
                onPropertyClick={handlePropertyClick}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Fallback: Show at least one view */}
        {!showList && !showMap && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-4">👆 Enable List or Map view above</p>
              <button
                onClick={() => {
                  setShowList(true);
                  setShowMap(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Show Both Views
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
