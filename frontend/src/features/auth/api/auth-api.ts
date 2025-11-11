import { apiClient, type Tokens } from '@/shared/api/base';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  tokens: Tokens;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // TODO заменить на метод apiClient
    const response = await apiClient.instance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // TODO заменить на метод apiClient
    const response = await apiClient.instance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // TODO заменить на метод apiClient
    await apiClient.instance.post('/auth/logout');
  },

  refreshTokens: async (refreshToken: string): Promise<Tokens> => {
    // TODO заменить на метод apiClient
    const response = await apiClient.instance.post<Tokens>('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    // TODO заменить на метод apiClient
    const response = await apiClient.instance.get('/auth/profile');
    return response.data;
  },
};