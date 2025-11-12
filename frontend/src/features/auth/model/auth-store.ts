import { makeAutoObservable, runInAction } from 'mobx';
import { authApi, type LoginCredentials, type RegisterData, type AuthResponse } from '../api/auth-api';
import { tokenService } from '@/shared/api/base';

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
  login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      this.setLoading(true);
      this.setError(null);

      const data: AuthResponse = await authApi.login(credentials);
      tokenService.setTokens(data.access_token);
      const stats = await authApi.getStats();

      runInAction(() => {
        this.userStats = stats;
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

  register = async (data: RegisterData): Promise<void> => {
    try {
      this.setLoading(true);
      this.setError(null);

      const response: AuthResponse = await authApi.register(data);
      tokenService.setTokens(response.access_token);
      const stats = await authApi.getStats();

      runInAction(() => {
        this.userStats = stats;
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

      const user = await authApi.getStats();
      
      runInAction(() => {
        this.userStats = user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      // Если запрос профиля failed, очищаем токены
      tokenService.clearTokens();
      
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