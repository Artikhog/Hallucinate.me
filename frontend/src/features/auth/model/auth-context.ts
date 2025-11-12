import { createContext, useContext } from 'react';
import { type AuthStore } from './auth-store';

export const AuthContext = createContext<AuthStore | null>(null);

export function useAuthStore(): AuthStore {
    const store = useContext(AuthContext);
    if (!store) {
        throw new Error('useAuthStore must be used within AuthProvider');
    }
    return store;
}

// Альтернативный хук с наблюдаемыми значениями
import { useObserver } from 'mobx-react-lite';

export function useAuth() {
    const store = useAuthStore();

    return useObserver(() => ({
        // State
        useStats: store.userStats,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        error: store.error,

        // Actions
        login: store.login,
        register: store.register,
        logout: store.logout,
        checkAuth: store.checkAuth,
        reset: store.reset,
    }));
}