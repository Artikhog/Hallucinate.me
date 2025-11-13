import { makeAutoObservable, runInAction } from 'mobx';
import { authApi } from '../api/auth-api';
import { apiClient, tokenService } from '@/shared/api/base';
import type { TokenResponse, UserLogin, UserRegister } from '@/shared/api/api';

export interface UserStats {
  total_score: number;
  sessions_played: number;
  successful_reports: number;
  global_rank: number;
}

export class AuthStore {
  userStats: UserStats | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  setUserStats = (user: UserStats | null) => {
    this.userStats = user;
    this.isAuthenticated = !!user;
  };

  setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  setError = (error: string | null) => {
    this.error = error;
  };

  // Async actions
  login = async (credentials: UserLogin): Promise<void> => {
    try {
      this.setLoading(true);
      this.setError(null);

      const data: TokenResponse = await authApi.login(credentials);
      console.log(data)
      await tokenService.setTokens(data.access_token);

      runInAction(() => {
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Login failed';
        this.isLoading = false;
      });
      throw error;
    }
  };

  getUserStats = async () => {
    const stats = await authApi.getStats();
    runInAction(() => {
      this.userStats = stats;
    });
  }

  register = async (data: UserRegister): Promise<void> => {
    try {
      this.setLoading(true);
      this.setError(null);

      const response: TokenResponse = await authApi.register(data);
      await tokenService.setTokens(response.access_token);

      runInAction(() => {
        this.userStats = null;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Registration failed';
        this.isLoading = false;
      });
      throw error;
    }
  };

  logout = (): void => {
    tokenService.clearTokens();

    runInAction(() => {
      this.userStats = null;
      this.isAuthenticated = false;
      this.error = null;
    });
  };

  checkAuth = async (): Promise<void> => {
    try {
      this.setLoading(true);
      const token = `Bearer ${tokenService.getAccessToken()}`;

      if (!token) {
        runInAction(() => {
          this.isLoading = false;
        });
        return;
      }
      apiClient.instance.interceptors.request.use(
        (config) => {
          config.headers.Authorization = token;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      const user = await authApi.getStats();

      runInAction(() => {
        this.userStats = user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      // Если запрос профиля failed, очищаем токены
      // tokenService.clearTokens();

      runInAction(() => {
        this.userStats = null;
        this.isAuthenticated = false;
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Auth check failed';
      });
    }
  };

  // Reset store
  reset = (): void => {
    runInAction(() => {
      this.userStats = null;
      this.isAuthenticated = false;
      this.isLoading = false;
      this.error = null;
    });
  };
}

// Создаем экземпляр store
export const authStore = new AuthStore();