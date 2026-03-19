// Core API Client for AppUi
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_BASE_URL = "https://api.stravex.network/api";
export const TOKEN_KEY = "zyph_auth_token_ui";

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

class ApiClient {
  getToken() {
    // Note: AppUi previously used "token", let's make sure things stay consistent or we adapt. Let's use what the old file used: "token".
    return localStorage.getItem("token");
  }

  setToken(token) {
    localStorage.setItem("token", token);
  }

  removeToken() {
    localStorage.removeItem("token");
  }

  buildUrl(endpoint, params) {
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

  async request(endpoint, options = {}) {
    const { data, params, requiresAuth = true, ...customConfig } = options;

    const headers = {
      'Content-Type': 'application/json',
      ...customConfig.headers,
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
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
          responseData?.message || 'API request failed',
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Network error: ${error.message}`);
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', data });
  }

  put(endpoint, data = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', data });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
