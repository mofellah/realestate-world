import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertiesService } from "../../services/properties-service";

interface Property {
  id: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  surfaceArea?: number;
  address: {
    street?: string;
    city: string;
    country: string;
  };
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertiesService.getAllProperties(0, 100);
        setProperties(data.properties || []);
      } catch (err) {
        console.error("[MyProperties] Failed to load:", err);
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    if (!searchTerm) return true;
    return (
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div data-testid="my-properties-page" className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <Link
          to="/dashboard/create-property"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Property
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <input
          type="text"
          placeholder="Search by type or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first property</p>
          <Link
            to="/dashboard/create-property"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Property
          </Link>
        </div>
      ) : (
        <div data-testid="property-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              data-testid="property-card"
              className="bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              {/* Property Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg overflow-hidden flex items-center justify-center">
                <div className="text-blue-400">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 data-testid="property-title" className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {property.type}
                </h3>

                <p data-testid="property-address" className="text-gray-600 text-sm mb-3">
                  {property.address.street && `${property.address.street}, `}
                  {property.address.city}, {property.address.country}
                </p>

                <div data-testid="property-status" className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-3">
                  Active
                </div>

                {(property.bedrooms || property.bathrooms || property.surfaceArea) && (
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms && <span>🛏️ {property.bedrooms} bed</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms} bath</span>}
                    {property.surfaceArea && <span>📏 {property.surfaceArea}m²</span>}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Link
                    data-testid="view-property-button"
                    to={`/property/${property.id}`}
                    className="flex-1 text-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm"
                  >
                    View
                  </Link>
                  <Link
                    data-testid="edit-property-button"
                    to={`/dashboard/properties/${property.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </Link>
                  <Link
                    data-testid="create-listing-button"
                    to={`/dashboard/properties/${property.id}/create-listing`}
                    className="w-full text-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    Create Listing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
