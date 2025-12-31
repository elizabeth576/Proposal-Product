import { apiClient, serverFetch } from './client';
import { API_ENDPOINTS } from '@/constants';
import { DashboardSummary, ApiResponse } from '@/types';

// ============================================================================
// Client-Side API
// ============================================================================

export const dashboardApi = {
  /**
   * Get dashboard summary statistics
   */
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    return apiClient.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD_SUMMARY);
  },
};

// ============================================================================
// Server-Side API
// ============================================================================

export const dashboardServerApi = {
  /**
   * Get dashboard summary (server-side)
   */
  getSummary: async (accessToken: string): Promise<ApiResponse<DashboardSummary>> => {
    return serverFetch<DashboardSummary>(API_ENDPOINTS.DASHBOARD_SUMMARY, {
      accessToken,
      tags: ['dashboard', 'summary'],
      revalidate: 30, // Revalidate every 30 seconds
    });
  },
};
