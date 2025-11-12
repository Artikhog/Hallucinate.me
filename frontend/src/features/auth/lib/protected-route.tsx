import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../model/auth-context';
import { LoadingSpinner } from '@/shared/ui/kit/loading-spinner';
import { observer } from 'mobx-react-lite';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = observer(({ 
  children, 
  fallback = <LoadingSpinner />,
  requiredRole 
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    checkAuth
  } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Проверка ролей
  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, isLoading, requiredRole, navigate]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    return null;
  }

  return <>{children}</>;
});