import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { agenciesService } from "@/services/agencies-service";

interface PropertyListing {
  id: string;
  propertyId: string;
  type: "sale" | "rental" | "short_term" | "lease";
  status: "draft" | "published" | "paused" | "expired";
  property?: {
    id: string;
    type: string;
    address?: {
      street?: string;
      city?: string;
      country?: string;
    };
  };
  paymentTerms?: Array<{
    type: string;
    currency: string;
    amount?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function AgencyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await agenciesService.getPortfolio(user.id);
      setListings(data.listings || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load listings";
      setError(msg);
      console.error("[AgencyListings] Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (filter === "all") return true;
    return l.status === filter;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Agency Listings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
          disabled={loading}
        >
          <option value="all">All Listings</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading listings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {listing.property?.address?.street || "Unknown Address"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {listing.property?.address?.city}, {listing.property?.address?.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {listing.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          listing.status === "published"
                            ? "bg-green-100 text-green-800"
                            : listing.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : listing.status === "paused"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {listing.paymentTerms?.[0]?.amount
                        ? `${listing.paymentTerms[0].currency} ${listing.paymentTerms[0].amount.toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
