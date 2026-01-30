/**
 * Agencies Service
 * Handles all agency-related API calls (profile, portfolio, team, etc.)
 */

import { apiClient } from './api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface AgencyRole {
  userId: string;
  role: 'owner' | 'manager' | 'agent' | 'sales_manager' | 'support_agent';
  user?: {
    id: string;
    email: string;
  };
}

export interface AgencyInfo {
  id: string;
  personId: string;
  tier: 'basic' | 'pro' | 'premium';
  description?: string;
  profileImageUrl?: string;
  maxAgents?: number;
  maxListings?: number;
  person?: {
    id: string;
    email: string;
    businessName?: string;
  };
  employees?: AgencyRole[];
  subscription?: {
    id: string;
    status: string;
    expiresAt?: string;
  };
}

export interface PropertyListing {
  id: string;
  propertyId: string;
  type: 'sale' | 'rental' | 'short_term' | 'lease';
  status: 'draft' | 'published' | 'paused' | 'expired';
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

export interface AgencyPortfolio {
  agencyId: string;
  totalListings: number;
  activeListings: number;
  listings: PropertyListing[];
}

export interface CreateAgencyDto {
  personId: string;
  tier?: 'basic' | 'pro' | 'premium';
  description?: string;
  profileImageUrl?: string;
  maxAgents?: number;
  maxListings?: number;
}

export interface UpdateAgencyDto {
  tier?: string;
  description?: string;
  profileImageUrl?: string;
  maxAgents?: number;
  maxListings?: number;
}

export interface AddAgentDto {
  userId: string;
  role: 'owner' | 'manager' | 'agent' | 'sales_manager' | 'support_agent';
}

// ============================================================================
// SERVICE
// ============================================================================

class AgenciesService {
  /**
   * Create a new agency
   */
  async createAgency(data: CreateAgencyDto): Promise<AgencyInfo> {
    return apiClient.post<AgencyInfo>('/agencies', data);
  }

  /**
   * Get agency information
   */
  async getAgency(id: string): Promise<AgencyInfo> {
    return apiClient.get<AgencyInfo>(`/agencies/${id}`);
  }

  /**
   * Update agency information (owner only)
   */
  async updateAgency(id: string, data: UpdateAgencyDto): Promise<AgencyInfo> {
    return apiClient.patch<AgencyInfo>(`/agencies/${id}`, data);
  }

  /**
   * Add agent to agency (owner/manager only)
   */
  async addAgent(agencyId: string, data: AddAgentDto): Promise<AgencyRole> {
    return apiClient.post<AgencyRole>(`/agencies/${agencyId}/agents`, data);
  }

  /**
   * Remove agent from agency (owner only)
   */
  async removeAgent(agencyId: string, agentUserId: string): Promise<void> {
    return apiClient.delete(`/agencies/${agencyId}/agents/${agentUserId}`);
  }

  /**
   * Get agency portfolio (all listings)
   */
  async getPortfolio(agencyId: string, skip = 0, take = 20): Promise<AgencyPortfolio> {
    return apiClient.get<AgencyPortfolio>(`/agencies/${agencyId}/portfolio?skip=${skip}&take=${take}`);
  }

  /**
   * Get agency team (employees)
   */
  async getTeam(agencyId: string): Promise<AgencyRole[]> {
    const agency = await this.getAgency(agencyId);
    return agency.employees || [];
  }
}

export const agenciesService = new AgenciesService();
