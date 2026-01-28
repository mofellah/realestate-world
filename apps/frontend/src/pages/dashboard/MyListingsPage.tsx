import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  propertyId: string;
  title: string;
  price: number;
  status: 'active' | 'pending' | 'sold' | 'expired';
  views: number;
  inquiries: number;
  publishedAt: string;
  expiresAt: string;
  featured: boolean;
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData: Listing[] = [
        {
          id: '1',
          propertyId: 'prop-1',
          title: 'Modern Family Home',
          price: 450000,
          status: 'active',
          views: 342,
          inquiries: 12,
          publishedAt: '2024-01-15',
          expiresAt: '2024-04-15',
          featured: true,
        },
        {
          id: '2',
          propertyId: 'prop-2',
          title: 'Downtown Apartment',
          price: 280000,
          status: 'active',
          views: 189,
          inquiries: 5,
          publishedAt: '2024-01-20',
          expiresAt: '2024-04-20',
          featured: false,
        },
      ];
      setListings(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) => filter === 'all' || listing.status === filter
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleToggleFeatured = async (id: string) => {
    // TODO: API call to toggle featured status
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, featured: !l.featured } : l
    ));
  };

  const handleRenewListing = async (id: string) => {
    // TODO: API call to renew listing
    console.log('Renewing listing:', id);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <button
            onClick={() => navigate('/dashboard/create-listing')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Listing
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Active Listings</div>
            <div className="text-2xl font-bold text-gray-900">
              {listings.filter(l => l.status === 'active').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Total Views</div>
            <div className="text-2xl font-bold text-gray-900">
              {listings.reduce((sum, l) => sum + l.views, 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Total Inquiries</div>
            <div className="text-2xl font-bold text-gray-900">
              {listings.reduce((sum, l) => sum + l.inquiries, 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Avg. Inquiries</div>
            <div className="text-2xl font-bold text-gray-900">
              {listings.length > 0 ? Math.round(listings.reduce((sum, l) => sum + l.inquiries, 0) / listings.length) : 0}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Listings</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquiries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{listing.title}</div>
                      <div className="text-sm text-gray-500">${listing.price.toLocaleString()}</div>
                      {listing.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(listing.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {listing.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {listing.inquiries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(listing.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(listing.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {listing.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                    <button className="text-green-600 hover:text-green-900">Edit</button>
                    {listing.status === 'expired' && (
                      <button
                        onClick={() => handleRenewListing(listing.id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Renew
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredListings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No listings found. <button onClick={() => navigate('/dashboard/create-listing')} className="text-blue-600 hover:underline">Create your first listing</button>
            </div>
          )}
        </div>
      </div>
  );
}
