import { API_BASE_URL } from '@/constants';
import { ApiResponse, ApiError } from '@/types';
import { getErrorMessage } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

interface TokenManager {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}

// ============================================================================
// Token Management
// ============================================================================

const TOKEN_KEYS = {
  ACCESS: 'proposal_access_token',
  REFRESH: 'proposal_refresh_token',
} as const;

export const tokenManager: TokenManager = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  },
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  },
};

// ============================================================================
// API Error Class
// ============================================================================

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code: string = 'UNKNOWN_ERROR',
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromApiError(error: ApiError, status: number): ApiRequestError {
    return new ApiRequestError(
      error.error.message,
      status,
      error.error.code,
      error.error.details
    );
  }
}

// ============================================================================
// Request Helpers
// ============================================================================

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

function buildHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  });

  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

// ============================================================================
// Token Refresh Logic
// ============================================================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      return null;
    }

    const data = await response.json();
    tokenManager.setTokens(data.data.access_token, data.data.refresh_token);
    return data.data.access_token;
  } catch {
    tokenManager.clearTokens();
    return null;
  }
}

// ============================================================================
// Core Request Function
// ============================================================================

async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, ...fetchConfig } = config;

  const url = buildUrl(endpoint, params);
  const headers = buildHeaders(customHeaders);

  const fetchOptions: RequestInit = {
    ...fetchConfig,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // Handle 401 with token refresh
    if (response.status === 401 && tokenManager.getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(url, { ...fetchOptions, headers });
        } else {
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new ApiRequestError('Session expired', 401, 'SESSION_EXPIRED');
        }
      } else {
        // Wait for token refresh
        const newToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh(resolve);
        });
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, { ...fetchOptions, headers });
      }
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw ApiRequestError.fromApiError(responseData as ApiError, response.status);
    }

    return responseData as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(getErrorMessage(error), 500, 'NETWORK_ERROR');
  }
}

// ============================================================================
// HTTP Method Wrappers
// ============================================================================

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

// ============================================================================
// Server-Side Fetch (for Server Components)
// ============================================================================

export async function serverFetch<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    accessToken?: string;
    tags?: string[];
    revalidate?: number | false;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params, accessToken, tags, revalidate } = options;

  const url = buildUrl(endpoint, params);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit & { next?: { tags?: string[]; revalidate?: number | false } } = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  if (tags || revalidate !== undefined) {
    fetchOptions.next = {};
    if (tags) fetchOptions.next.tags = tags;
    if (revalidate !== undefined) fetchOptions.next.revalidate = revalidate;
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json();

  if (!response.ok) {
    throw ApiRequestError.fromApiError(data as ApiError, response.status);
  }

  return data as ApiResponse<T>;
}
