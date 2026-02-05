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
  const [filterPanelOpen] = useState(true);

  const getPrimaryListing = (property: any) => property.listings?.[0];

  const getListingLabel = (property: any) => {
    const listing = getPrimaryListing(property);
    if (!listing?.type) return "Listing";
    const label = listing.type.toString().replace("_", " ").toLowerCase();
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const getPriceValue = (property: any) => {
    const listing = getPrimaryListing(property);
    const paymentTerms = listing?.paymentTerms;
    if (!paymentTerms) return null;

    if (paymentTerms.amount) return paymentTerms.amount;
    if (paymentTerms.amountPerPeriod) return paymentTerms.amountPerPeriod;
    if (paymentTerms.onetimePayment?.amount) return paymentTerms.onetimePayment.amount;
    if (paymentTerms.periodicPayment?.amountPerPeriod)
      return paymentTerms.periodicPayment.amountPerPeriod;
    return null;
  };

  const getPricePerSqm = (property: any) => {
    const priceValue = getPriceValue(property);
    if (!priceValue || !property.surfaceArea) return null;
    return Math.round(priceValue / property.surfaceArea);
  };

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
    const debounceId = window.setTimeout(() => {
      search(filters, center);
    }, 300);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [filters, center, search]);

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
    <div data-testid="search-page" className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">Search results</p>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1">
                  {total} listings
                </span>
              </div>
              <p className="text-sm text-gray-500">Browse listings and refine your search.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-4 py-2 rounded-full border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition">
                Create alert
              </button>
              <div className="relative">
                <select className="appearance-none px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 bg-white pr-8">
                  <option>Sort: Relevance</option>
                  <option>Price (low to high)</option>
                  <option>Price (high to low)</option>
                  <option>Newest</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </span>
              </div>
              <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
                <button
                  data-testid="view-toggle-list"
                  onClick={() => setShowList(!showList)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    showList ? "bg-white text-gray-900 shadow" : "text-gray-500"
                  }`}
                >
                  List
                </button>
                <button
                  data-testid="view-toggle-map"
                  onClick={() => setShowMap(!showMap)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    showMap ? "bg-white text-gray-900 shadow" : "text-gray-500"
                  }`}
                >
                  Map
                </button>
              </div>
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
            } overflow-y-auto bg-slate-50 border-r border-gray-200`}
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
                  <div data-testid="listing-grid" className="grid grid-cols-1 gap-5">
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
                          className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex border border-gray-100"
                        >
                          <div className="w-44 h-44 bg-gray-100 flex-shrink-0 relative">
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                              No Image
                            </div>
                          </div>
                          <div className="p-5 flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                                {getListingLabel(property)}
                              </span>
                              {getPrimaryListing(property)?.createdAt && (
                                <span>
                                  Listed{" "}
                                  {new Date(
                                    getPrimaryListing(property).createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-700 transition">
                              {property.title}
                            </h3>
                            <p
                              data-testid="property-address"
                              className="text-gray-600 text-sm mb-3"
                            >
                              {typeof property.address === "string"
                                ? property.address
                                : property.address?.city || "No location"}
                            </p>
                            <div className="flex flex-wrap items-baseline gap-2 mb-3">
                              <p
                                data-testid="property-price"
                                className="text-xl font-bold text-gray-900"
                              >
                                {formatPrice(property)}
                              </p>
                              {getPricePerSqm(property) && (
                                <span className="text-sm text-gray-500">
                                  {getPricePerSqm(property)?.toLocaleString()} €/m²
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span data-testid="property-type">
                                {property.propertyType || "Property"}
                              </span>
                              {property.bedrooms && (
                                <span data-testid="property-bedrooms">
                                  {property.bedrooms} beds
                                </span>
                              )}
                              {property.bathrooms && <span>{property.bathrooms} baths</span>}
                              {property.surfaceArea && <span>{property.surfaceArea} m²</span>}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                    <span>
                      Showing {properties.length} of {total} results
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 cursor-not-allowed">
                        Prev
                      </button>
                      <button className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700">
                        1
                      </button>
                      <button className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 cursor-not-allowed">
                        Next
                      </button>
                    </div>
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
