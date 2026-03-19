import { apiClient } from './apiClient';

export const usersApi = {
  getProfile: () => apiClient.get("/users/profile"),

  updateProfile: (userData) => apiClient.put("/users/profile", userData),

  completeOnboarding: () => apiClient.post("/users/onboarding/complete"),

  completePractice: () => apiClient.post("/users/practice/complete"),

  getHistory: () => apiClient.get("/users/history"),

  getStats: () => apiClient.get("/users/stats"),
};
