import { apiClient } from './apiClient';

const TOKEN_KEY = 'zyph_auth_token';

export type UserRole = 'admin' | 'user';

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    };
  };
  message?: string;
  errors?: any[];
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password }, { requiresAuth: false });
    if (response.data?.token) {
      AuthService.setToken(response.data.token);
    }
    return response;
  }

  static async signup(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    registerAsAdmin: boolean = true
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/signup', 
      { firstName, lastName, email, password, registerAsAdmin },
      { requiresAuth: false }
    );
    if (response.data?.token) {
      AuthService.setToken(response.data.token);
    }
    return response;
  }

  static async getMe(): Promise<any> {
    return apiClient.get('/auth/me');
  }

  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
