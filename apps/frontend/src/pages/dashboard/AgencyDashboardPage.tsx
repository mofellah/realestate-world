import React, { useState, useEffect } from "react";
import { DashboardMetricsSkeleton } from "../../components/Skeleton";

interface AgencyMetrics {
  totalAgents: number;
  activeListings: number;
  totalSales: number;
  monthlyRevenue: number;
  pendingInquiries: number;
}

export default function AgencyDashboardPage() {
  const [metrics, setMetrics] = useState<AgencyMetrics>({
    totalAgents: 0,
    activeListings: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    pendingInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // API call to /api/agencies/:id/metrics
      // const data = await agencyService.getMetrics();
      // setMetrics(data);
      const mockMetrics = {
        totalAgents: 12,
        activeListings: 47,
        totalSales: 23,
        monthlyRevenue: 156000,
        pendingInquiries: 8,
      };
      setMetrics(mockMetrics);
      setLoading(false);
    } catch (error) {
      console.error("[AgencyDashboard] Failed to load metrics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Agency Dashboard</h1>

      {/* Metrics */}
      {loading ? (
        <DashboardMetricsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Total Agents</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalAgents}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Active Listings</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeListings}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Sales (MTD)</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalSales}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Revenue (MTD)</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(metrics.monthlyRevenue / 1000).toFixed(0)}k
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Pending Inquiries</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.pendingInquiries}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left">
            <div className="font-medium text-blue-900">Manage Team</div>
            <div className="text-sm text-blue-700">Add or remove agents</div>
          </button>
          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left">
            <div className="font-medium text-green-900">View Listings</div>
            <div className="text-sm text-green-700">All agency listings</div>
          </button>
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 text-left">
            <div className="font-medium text-purple-900">Reports</div>
            <div className="text-sm text-purple-700">Performance analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
}
