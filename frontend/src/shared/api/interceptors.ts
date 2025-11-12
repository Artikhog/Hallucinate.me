import { apiClient, tokenService } from './base';

// Интерцептор для добавления токена к запросам
apiClient.instance.interceptors.request.use(
    (config) => {
        const token = tokenService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            tokenService.clearTokens();
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);