import { apiClient } from './apiClient';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password }, { requiresAuth: false });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  signup: async (userData) => {
    const response = await apiClient.post("/auth/signup", userData, { requiresAuth: false });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  logout: () => {
    apiClient.removeToken();
  },

  getMe: () => apiClient.get("/auth/me"),

  walletAuth: async (walletAddress) => {
    const response = await apiClient.post("/auth/wallet", { walletAddress }, { requiresAuth: false });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },
};
