import { type ReactNode, useEffect } from 'react';
import { AuthContext } from '../model/auth-context';
import { authStore } from '../model/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // При монтировании провайдера проверяем авторизацию
    authStore.checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
}