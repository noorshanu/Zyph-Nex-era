//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
 const API_BASE_URL = "https://api.stravex.network/api";
const TOKEN_KEY = 'zyph_auth_token';

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  data?: any;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
}

/**
 * Core API Client handling requests, interceptors, auth headers, and response parsing.
 */
class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { data, params, requiresAuth = true, ...customConfig } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customConfig.headers as Record<string, string> || {}),
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...customConfig,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, config);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new ApiError(
          response.status,
          responseData?.message || 'An error occurred during the request.',
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // HTTP Method Helpers
  public get<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  public put<T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  public delete<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public patch<T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method' | 'data'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }
}

export const apiClient = new ApiClient();
