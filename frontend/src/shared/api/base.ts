import { Api } from './api';

// Базовый URL API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Создаем экземпляр axios
export const apiClient = new Api({
    baseURL: API_BASE_URL,
})

// Сервис для работы с токенами в localStorage
export const tokenService = {
    getAccessToken: (): string | null =>
        localStorage.getItem('accessToken')
    ,

    setTokens: (token: string): void => {
        localStorage.setItem('accessToken', token);
    },

    clearTokens: (): void => {
        localStorage.removeItem('accessToken');
    },
};