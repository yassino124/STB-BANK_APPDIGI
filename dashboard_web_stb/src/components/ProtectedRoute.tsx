import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, defaultPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid var(--border-color)', borderTopColor: '#2962FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.some((r) => user.roles.includes(r))) {
    // Redirect to the user's default home instead of just '/'
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;