import { apiClient, serverFetch } from './client';
import { API_ENDPOINTS } from '@/constants';
import {
  Proposal,
  ProposalCreateInput,
  ProposalUpdateInput,
  ProposalFilters,
  ProposalGenerateInput,
  ProposalGenerateResponse,
  ApiResponse,
  ApiMeta,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface ProposalsListResponse {
  proposals: Proposal[];
  meta: ApiMeta;
}

export interface ProposalApproveInput {
  comments?: string;
}

export interface ProposalRejectInput {
  reason: string;
}

// ============================================================================
// Client-Side API (for Client Components)
// ============================================================================

export const proposalsApi = {
  /**
   * Get paginated list of proposals with optional filters
   */
  list: async (filters?: ProposalFilters): Promise<ApiResponse<ProposalsListResponse>> => {
    return apiClient.get<ProposalsListResponse>(
      API_ENDPOINTS.PROPOSALS,
      filters as Record<string, string | number | boolean | undefined>
    );
  },

  /**
   * Get a single proposal by ID
   */
  getById: async (id: string): Promise<ApiResponse<Proposal>> => {
    return apiClient.get<Proposal>(API_ENDPOINTS.PROPOSAL_BY_ID(id));
  },

  /**
   * Create a new proposal
   * Status will be set to 'pending' initially, then 'approval_pending' after server processing
   */
  create: async (data: ProposalCreateInput): Promise<ApiResponse<Proposal>> => {
    return apiClient.post<Proposal>(API_ENDPOINTS.PROPOSALS, data);
  },

  /**
   * Update an existing proposal
   */
  update: async (data: ProposalUpdateInput): Promise<ApiResponse<Proposal>> => {
    const { id, ...updateData } = data;
    return apiClient.put<Proposal>(API_ENDPOINTS.PROPOSAL_BY_ID(id), updateData);
  },

  /**
   * Delete a proposal
   */
  delete: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.PROPOSAL_BY_ID(id));
  },

  /**
   * Approve a proposal (privileged roles only)
   * Changes status from 'approval_pending' to 'completed'
   */
  approve: async (id: string, data?: ProposalApproveInput): Promise<ApiResponse<Proposal>> => {
    return apiClient.post<Proposal>(API_ENDPOINTS.PROPOSAL_APPROVE(id), data);
  },

  /**
   * Reject a proposal (privileged roles only)
   * Changes status from 'approval_pending' to 'rejected'
   */
  reject: async (id: string, data: ProposalRejectInput): Promise<ApiResponse<Proposal>> => {
    return apiClient.post<Proposal>(API_ENDPOINTS.PROPOSAL_REJECT(id), data);
  },

  /**
   * Generate proposal with signed document and audio URLs
   * Submits to /product/proposals/generate endpoint
   */
  generate: async (
    data: ProposalGenerateInput
  ): Promise<ApiResponse<ProposalGenerateResponse>> => {
    return apiClient.post<ProposalGenerateResponse>(
      API_ENDPOINTS.PROPOSAL_GENERATE,
      data
    );
  },
};

// ============================================================================
// Server-Side API (for Server Components)
// ============================================================================

export const proposalsServerApi = {
  /**
   * Get paginated list of proposals (server-side)
   */
  list: async (
    accessToken: string,
    filters?: ProposalFilters
  ): Promise<ApiResponse<ProposalsListResponse>> => {
    return serverFetch<ProposalsListResponse>(API_ENDPOINTS.PROPOSALS, {
      accessToken,
      params: filters as Record<string, string | number | boolean | undefined>,
      tags: ['proposals'],
      revalidate: 60, // Revalidate every 60 seconds
    });
  },

  /**
   * Get a single proposal by ID (server-side)
   */
  getById: async (accessToken: string, id: string): Promise<ApiResponse<Proposal>> => {
    return serverFetch<Proposal>(API_ENDPOINTS.PROPOSAL_BY_ID(id), {
      accessToken,
      tags: [`proposal-${id}`],
      revalidate: 30,
    });
  },

  /**
   * Get recent proposals for dashboard (server-side)
   */
  getRecent: async (
    accessToken: string,
    limit: number = 5
  ): Promise<ApiResponse<ProposalsListResponse>> => {
    return serverFetch<ProposalsListResponse>(API_ENDPOINTS.PROPOSALS, {
      accessToken,
      params: { limit },
      tags: ['proposals', 'dashboard'],
      revalidate: 30,
    });
  },
};
