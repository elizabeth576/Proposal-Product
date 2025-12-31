export { apiClient, tokenManager, ApiRequestError, serverFetch } from './client';
export { authApi } from './auth';
export { dashboardApi, dashboardServerApi } from './dashboard';
export { proposalsApi, proposalsServerApi } from './proposals';
export type { LoginInput, RegisterInput, AuthResult } from './auth';
export type { ProposalsListResponse, ProposalApproveInput, ProposalRejectInput } from './proposals';
