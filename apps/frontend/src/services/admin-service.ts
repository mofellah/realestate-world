/**
 * Admin Service
 * Handles admin dashboard and analytics API calls
 */

import { apiClient } from "./api-client";

// ============================================================================
// TYPES
// ============================================================================

export interface SystemMetrics {
  totalUsers: number;
  totalProperties: number;
  totalListings: number;
  activeListings: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: "user_registered" | "property_created" | "listing_published";
  description: string;
  timestamp: string;
}

// ============================================================================
// SERVICE
// ============================================================================

class AdminService {
  /**
   * Get system-wide metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    return apiClient.get<SystemMetrics>("/admin/metrics");
  }

  /**
   * Get recent system activity
   */
  async getActivity(limit = 10): Promise<RecentActivity[]> {
    return apiClient.get<RecentActivity[]>(`/admin/activity?limit=${limit}`);
  }
}

export const adminService = new AdminService();
