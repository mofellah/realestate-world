import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  propertyType: string;
  price: number;
  status: 'draft' | 'active' | 'sold' | 'rented';
  address: {
    street: string;
    city: string;
    state: string;
  };
  imageUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/properties/my-properties');
      // const data = await response.json();
      // setProperties(data);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setProperties([]);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Property['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      rented: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <Link
            to="/dashboard/properties/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Property
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first property listing</p>
            <Link
              to="/dashboard/properties/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                {/* Property Image */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {property.imageUrl ? (
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    {getStatusBadge(property.status)}
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {property.address.street}, {property.address.city}
                  </p>

                  <p className="text-xl font-bold text-blue-600 mb-3">
                    ${property.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {property.bedrooms} bed
                      </span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    {property.area && (
                      <span>{property.area} sqft</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/dashboard/properties/edit/${property.id}`}
                      className="flex-1 text-center bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {/* TODO: Implement delete */}}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
