import { apiClient } from './apiClient';
import { authApi } from './auth.service';
import { matchesApi } from './match.service';
import { usersApi } from './user.service';

export {
  apiClient,
  authApi,
  matchesApi,
  usersApi
};

export default {
  auth: authApi,
  matches: matchesApi,
  users: usersApi,
};
