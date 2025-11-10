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
    user, 
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
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
});