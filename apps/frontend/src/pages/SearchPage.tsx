// Search Page - Interactive map + filters + property list
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../stores/propertyStore';
import { useUIStore } from '../stores/uiStore';
import { PropertyType, ListingType } from '../types';

export default function SearchPage() {
  const { 
    filteredListings, 
    filters, 
    setFilters, 
    applyFilters, 
    clearFilters,
    isLoading 
  } = usePropertyStore();
  
  const { isFilterPanelOpen, toggleFilterPanel } = useUIStore();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Search Properties</h1>
            <p className="text-gray-600 mt-2">
              {filteredListings.length} properties found
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={toggleFilterPanel}
              className="px-4 py-2 bg-white rounded-lg font-medium hover:bg-gray-100"
            >
              🔍 Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Panel */}
          {isFilterPanelOpen && (
            <aside className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="space-y-2">
                  {Object.values(PropertyType).map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.propertyType?.includes(type) || false}
                        onChange={(e) => {
                          const current = filters.propertyType || [];
                          const updated = e.target.checked
                            ? [...current, type]
                            : current.filter(t => t !== type);
                          handleFilterChange('propertyType', updated);
                        }}
                        className="mr-2"
                      />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Listing Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type
                </label>
                <div className="space-y-2">
                  {Object.values(ListingType).map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.listingType?.includes(type) || false}
                        onChange={(e) => {
                          const current = filters.listingType || [];
                          const updated = e.target.checked
                            ? [...current, type]
                            : current.filter(t => t !== type);
                          handleFilterChange('listingType', updated);
                        }}
                        className="mr-2"
                      />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (€)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value) || undefined)}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value) || undefined)}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.bedroomsMin || ''}
                  onChange={(e) => handleFilterChange('bedroomsMin', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g., Brussels"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </aside>
          )}

          {/* Results */}
          <main className="flex-1">
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm p-6 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-xl font-medium">Interactive Map Coming Soon</p>
                  <p className="text-sm mt-2">Leaflet/Mapbox integration will be added</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-12">Loading...</div>
                ) : filteredListings.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No properties found. Try adjusting your filters.
                  </div>
                ) : (
                  filteredListings.map(listing => (
                    <Link
                      key={listing.id}
                      to={`/property/${listing.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      <img
                        src={listing.property.images?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={listing.property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {listing.property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {listing.property.address.city}, {listing.property.address.country_code}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            €{listing.paymentTerms.termType === 'onetime' 
                              ? (listing.paymentTerms as any).amount.toLocaleString()
                              : (listing.paymentTerms as any).amountPerPeriod.toLocaleString()
                            }
                            {listing.paymentTerms.termType !== 'onetime' && '/mo'}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                            {listing.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-3">
                          {listing.property.bedrooms && (
                            <span>🛏️ {listing.property.bedrooms}</span>
                          )}
                          {listing.property.bathrooms && (
                            <span>🚿 {listing.property.bathrooms}</span>
                          )}
                          {listing.property.surfaceArea && (
                            <span>📐 {listing.property.surfaceArea}m²</span>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          👁️ {listing.viewCount || 0} views • 💬 {listing.inquiryCount || 0} inquiries
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
