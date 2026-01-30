import React, { useState, useEffect } from 'react';

interface AgencyListing {
  id: string;
  title: string;
  agent: string;
  price: number;
  status: 'active' | 'sold' | 'pending';
  views: number;
  inquiries: number;
}

export default function AgencyListingsPage() {
  const [listings, setListings] = useState<AgencyListing[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // API call to fetch agency listings
      // const data = await agencyService.getListings();
      // setListings(data);
      const mockListings: AgencyListing[] = [
        { id: '1', title: 'Modern Family Home', agent: 'John Doe', price: 450000, status: 'active', views: 342, inquiries: 12 },
        { id: '2', title: 'Downtown Apartment', agent: 'Jane Smith', price: 280000, status: 'sold', views: 189, inquiries: 5 },
      ];
      setListings(mockListings);
    } catch (error) {
      console.error('[AgencyListings] Failed to load listings:', error);
    }
  };

  const filteredListings = listings.filter(l => filter === 'all' || l.status === filter);

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Agency Listings</h1>

        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Listings</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiries</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{listing.title}</div>
                      <div className="text-sm text-gray-500">${listing.price.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.agent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' :
                      listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.views}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.inquiries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
