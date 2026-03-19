import { apiClient } from './apiClient';

export interface Match {
  _id: string;
  title: string;
  type: 'free' | 'paid';
  entry_fee: number;
  prize_pool: number;
  join_window_minutes: number;
  match_duration_minutes: number;
  duration: number;
  status: 'scheduled' | 'open' | 'live' | 'completed' | 'settled' | 'upcoming';
  start_time: string;
  max_participants: number;
  current_participants: number;
  virtual_balance?: number;
}

export interface CreateMatchPayload {
  title: string;
  type: 'free' | 'paid';
  entry_fee: number;
  prize_pool: number;
  virtual_balance: number;
  join_window_minutes: number;
  match_duration_minutes: number;
  max_participants: number;
  start_time: string;
}

export interface MatchHistoryEntry {
  _id: string;
  title: string;
  type: 'free' | 'paid';
  status: 'completed' | 'settled';
  entry_fee: number;
  prize_pool: number;
  total_participants: number;
  max_participants: number;
  start_time: string;
  end_time: string;
  match_duration_minutes: number;
  winner: {
    username: string;
    wallet_address?: string;
    pnl_percentage: number;
    reward: number;
  } | null;
  total_prize_distributed: number;
}

export class MatchService {
  static async getAll(): Promise<any> {
    return apiClient.get('/matches');
  }

  static async create(matchData: CreateMatchPayload): Promise<any> {
    return apiClient.post('/admin/matches', matchData);
  }

  static async delete(matchId: string): Promise<any> {
    return apiClient.delete(`/admin/matches/${matchId}`);
  }

  static async getParticipants(matchId: string): Promise<any> {
    return apiClient.get(`/admin/matches/${matchId}/participants`);
  }

  static async getLeaderboard(matchId: string): Promise<any> {
    return apiClient.get(`/admin/matches/${matchId}/leaderboard`);
  }

  static async getHistory(page: number = 1, limit: number = 15): Promise<any> {
    return apiClient.get(`/admin/match-history?page=${page}&limit=${limit}`);
  }
}
