import { apiClient } from './apiClient';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  walletAddress?: string;
  skill_rating: number;
  balance: number;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  skill_rating?: number;
  balance?: number;
  role?: string;
}

export class UserService {
  static async getAll(): Promise<GetUsersResponse> {
    return apiClient.get<GetUsersResponse>('/admin/users');
  }

  static async create(userData: CreateUserPayload): Promise<any> {
    return apiClient.post('/admin/users', userData);
  }

  static async delete(userId: string): Promise<any> {
    return apiClient.delete(`/admin/users/${userId}`);
  }
}
