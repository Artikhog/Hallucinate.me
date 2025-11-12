import {apiClient} from '@/shared/api/base';
import type {UserStats} from "@/features/auth/model/auth-store.ts";
import type { TokenResponse, UserLogin, UserRegister } from '@/shared/api/api';

export const authApi = {
  login: async (credentials: UserLogin): Promise<TokenResponse> => {
    const response = await apiClient.authentication.loginAuthLoginPost(credentials);
    return response.data as TokenResponse;
  },

  register: async (data: UserRegister): Promise<TokenResponse> => {
    const response = await apiClient.authentication.registerAuthRegisterPost(data);
    return response.data as TokenResponse;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.users.getUserStatsUsersMeStatsGet();
    return response.data;
  },
};