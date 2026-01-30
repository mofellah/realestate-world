import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapView from '@/components/Map/MapView';
import FilterPanel, { PropertyFilters } from '@/components/Map/FilterPanel';
import { useMapSearch } from '@/hooks/useMapSearch';
import { PropertyCardSkeleton } from '@/components/Skeleton';

export default function SearchPage() {
  const { properties, total, loading, search, error } = useMapSearch();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [center] = useState<[number, number]>([4.3517, 50.8503]); // Brussels

  useEffect(() => {
    // Initial search
    search(filters, center);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Properties loaded and updated
  }, [properties, total]);

  const handleApplyFilters = () => {
    search(filters, center);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Search Properties</h1>
            <p className="text-gray-600 mt-2">
              {total} properties found
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
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Panel */}
          <aside className="w-80">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onApply={handleApplyFilters}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-semibold">Search Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && viewMode === 'map' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
                <MapView 
                  center={center} 
                  zoom={12}
                  properties={properties}
                />
              </div>
            )}

            {!loading && viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No properties found. Try adjusting your filters.
                  </div>
                ) : (
                  properties.map((property) => (
                    <Link 
                      key={property.id}
                      to={`/property/${property.id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-200">
                        <div className="h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {typeof property.address === 'string' 
                            ? property.address 
                            : property.address?.city || 'No location'}
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          ${property.price?.toLocaleString() ?? 'N/A'}
                        </p>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                          {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                          {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                          {property.areaSquareMeters && <span>📏 {property.areaSquareMeters}m²</span>}
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
