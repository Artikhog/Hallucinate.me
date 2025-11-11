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

// Интерцептор для обработки ошибок и refresh токена
apiClient.instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 и это не запрос на обновление токена
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = tokenService.getRefreshToken();
                if (refreshToken) {
                    // Запрос на обновление токена
                    const response = await apiClient.instance.post('/auth/refresh', {
                        refreshToken
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    tokenService.setTokens({
                        accessToken,
                        refreshToken: newRefreshToken,
                    });

                    // Повторяем оригинальный запрос с новым токеном
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient.instance(originalRequest);
                }
            } catch (refreshError) {
                // Если refresh не удался, разлогиниваем пользователя
                tokenService.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);