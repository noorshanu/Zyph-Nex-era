import { apiClient } from './apiClient';

export const matchesApi = {
  getAll: (params = {}) => {
    // Pass params down to apiClient to handle searchParams internally
    return apiClient.get("/matches", { params });
  },

  getById: (id) => apiClient.get(`/matches/${id}`),

  join: (id) => apiClient.post(`/matches/${id}/join`),

  submitPortfolio: (id, portfolio) =>
    apiClient.post(`/matches/${id}/portfolio`, portfolio),

  getMyPortfolio: (id) => apiClient.get(`/matches/${id}/my-portfolio`),

  getLeaderboard: (id) => apiClient.get(`/matches/${id}/leaderboard`),

  lockPortfolio: (id) => apiClient.post(`/matches/${id}/portfolio/lock`),

  getAssets: () => apiClient.get("/matches/assets"),

  /** Real-time prices and 24h change from CoinGecko (via backend) */
  getPrices: () => apiClient.get("/matches/prices", { requiresAuth: false }),
};
