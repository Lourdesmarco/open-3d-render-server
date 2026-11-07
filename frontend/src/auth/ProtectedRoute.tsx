
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: '#111411',
        color: '#36E452',
        fontSize: '14px',
        letterSpacing: '1px'
      }}>
        CARGANDO SESIÓN...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
