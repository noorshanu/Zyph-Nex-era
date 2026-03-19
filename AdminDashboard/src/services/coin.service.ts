import { apiClient } from './apiClient';

export interface Coin {
  _id: string;
  symbol: string;
  name: string;
  icon: string;
  coingecko_id: string;
  is_active: boolean;
}

export interface GetCoinsResponse {
  success: boolean;
  data: Coin[];
  message?: string;
}

export interface CreateCoinPayload {
  symbol: string;
  name: string;
  icon: string;
  coingecko_id: string;
}

export interface UpdateCoinPayload {
  is_active?: boolean;
}

export class CoinService {
  static async getAll(): Promise<GetCoinsResponse> {
    return apiClient.get<GetCoinsResponse>('/admin/coins');
  }

  static async create(coinData: CreateCoinPayload): Promise<any> {
    return apiClient.post('/admin/coins', coinData);
  }

  static async update(coinId: string, data: UpdateCoinPayload): Promise<any> {
    return apiClient.put(`/admin/coins/${coinId}`, data);
  }

  static async delete(coinId: string): Promise<any> {
    return apiClient.delete(`/admin/coins/${coinId}`);
  }
}
