import {apiClient} from '@/shared/api/base';
import type {UserStats} from "@/features/auth/model/auth-store.ts";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string,
  token_type: string,
  username: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.instance.post<AuthResponse>('/auth/login', credentials);
    return response.data as AuthResponse;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.instance.post<AuthResponse>('/auth/register', data);
    return response.data as AuthResponse;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.instance.get('/users/me/stats');
    return response.data;
  },
};