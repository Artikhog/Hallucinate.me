import { makeAutoObservable, runInAction } from 'mobx';
import { authApi, type LoginCredentials, type RegisterData, type AuthResponse } from '../api/auth-api';
import { tokenService } from '@/shared/api/base';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string; // опционально, для ролевой системы
}

export class AuthStore {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  setUser = (user: User | null) => {
    this.user = user;
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
      tokenService.setTokens(data.tokens);

      runInAction(() => {
        this.user = data.user;
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
      tokenService.setTokens(response.tokens);

      runInAction(() => {
        this.user = response.user;
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
    // Не ждем ответ от сервера, сразу разлогиниваем
    authApi.logout().catch(console.error);
    tokenService.clearTokens();

    runInAction(() => {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    });
  };

  checkAuth = async (): Promise<void> => {
    try {
      this.setLoading(true);
      
      const token = tokenService.getAccessToken();
      if (!token) {
        runInAction(() => {
          this.isLoading = false;
        });
        return;
      }

      const user = await authApi.getProfile();
      
      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      // Если запрос профиля failed, очищаем токены
      tokenService.clearTokens();
      
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Auth check failed';
      });
    }
  };

  // Computed values (геттеры)
  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  get userName(): string {
    return this.user?.name || 'User';
  }

  get userEmail(): string {
    return this.user?.email || '';
  }

  // Reset store
  reset = (): void => {
    runInAction(() => {
      this.user = null;
      this.isAuthenticated = false;
      this.isLoading = false;
      this.error = null;
    });
  };
}

// Создаем экземпляр store
export const authStore = new AuthStore();