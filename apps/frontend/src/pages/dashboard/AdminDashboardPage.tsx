import React, { useState, useEffect } from "react";
import { adminService } from "../../services/admin-service";
import { DashboardMetricsSkeleton } from "../../components/Skeleton";

interface SystemMetrics {
  totalUsers: number;
  totalProperties: number;
  totalListings: number;
  activeListings: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: "user_registered" | "property_created" | "listing_published";
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalProperties: 0,
    totalListings: 0,
    activeListings: 0,
    revenue: 0,
  });
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    fetchActivity();
  }, []);

  const fetchMetrics = async () => {
    try {
      // API call to /api/admin/metrics
      // const data = await adminService.getMetrics();
      // setMetrics(data);
      const data = await adminService.getMetrics();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error("[AdminDashboard] Failed to load metrics:", error);
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      // API call to /api/admin/activity
      // const data = await adminService.getActivity();
      // setActivity(data);
      const data = await adminService.getActivity(10);
      setActivity(data);
    } catch (error) {
      console.error("[AdminDashboard] Failed to load activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <DashboardMetricsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics.totalUsers.toLocaleString()}
          </div>
          <div className="text-green-600 text-sm mt-1">+12% this month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Properties</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics.totalProperties.toLocaleString()}
          </div>
          <div className="text-green-600 text-sm mt-1">+8% this month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Listings</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics.totalListings.toLocaleString()}
          </div>
          <div className="text-blue-600 text-sm mt-1">{metrics.activeListings} active</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Active Listings</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {metrics.activeListings.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {Math.round((metrics.activeListings / metrics.totalListings) * 100)}% of total
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Revenue (MTD)</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            ${(metrics.revenue / 1000).toFixed(1)}k
          </div>
          <div className="text-green-600 text-sm mt-1">+15% this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  {item.type === "user_registered" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </div>
                  )}
                  {item.type === "property_created" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                  )}
                  {item.type === "listing_published" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
              <div className="font-medium text-blue-900">Manage Users</div>
              <div className="text-sm text-blue-700">View and manage user accounts</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
              <div className="font-medium text-green-900">Review Listings</div>
              <div className="text-sm text-green-700">Approve or reject pending listings</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
              <div className="font-medium text-purple-900">System Settings</div>
              <div className="text-sm text-purple-700">Configure platform settings</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition">
              <div className="font-medium text-yellow-900">View Reports</div>
              <div className="text-sm text-yellow-700">Generate analytics reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
