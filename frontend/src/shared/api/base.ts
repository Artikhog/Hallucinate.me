import { Api } from './api';

// Базовый URL API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Создаем экземпляр axios
export const apiClient = new Api({
    baseURL: API_BASE_URL,
    securityWorker: () => {
        return {
            headers: {
                Authorization: `Bearer ${tokenService.getAccessToken()}`,
            },
        };
    },
})

// Интерфейс для токенов
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

// Сервис для работы с токенами в localStorage
export const tokenService = {
    getAccessToken: (): string | null =>
        localStorage.getItem('accessToken'),

    getRefreshToken: (): string | null =>
        localStorage.getItem('refreshToken'),

    setTokens: (tokens: Tokens): void => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    },

    clearTokens: (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
};