import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Beautiful animated skeleton that mimics the dashboard layout
const DashboardSkeleton = () => (
  <div style={{ padding: '2rem', animation: 'none' }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .skeleton-box {
        background: linear-gradient(90deg,
          rgba(255,255,255,0.04) 25%,
          rgba(255,255,255,0.08) 50%,
          rgba(255,255,255,0.04) 75%
        );
        background-size: 1000px 100%;
        animation: shimmer 1.6s infinite linear;
        border-radius: 12px;
      }
    `}</style>

    {/* Header skeleton */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <div className="skeleton-box" style={{ width: 280, height: 32, marginBottom: 10 }} />
        <div className="skeleton-box" style={{ width: 200, height: 18 }} />
      </div>
      <div className="skeleton-box" style={{ width: 160, height: 40, borderRadius: 20 }} />
    </div>

    {/* KPI cards skeleton */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div className="skeleton-box" style={{ width: 44, height: 44, borderRadius: 12 }} />
            <div className="skeleton-box" style={{ width: 60, height: 20, borderRadius: 8 }} />
          </div>
          <div className="skeleton-box" style={{ width: 80, height: 42, marginBottom: 8 }} />
          <div className="skeleton-box" style={{ width: 140, height: 16 }} />
        </div>
      ))}
    </div>

    {/* Charts row skeleton */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
        <div className="skeleton-box" style={{ width: 220, height: 22, marginBottom: 24 }} />
        <div className="skeleton-box" style={{ width: '100%', height: 220, borderRadius: 16 }} />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
        <div className="skeleton-box" style={{ width: 160, height: 22, marginBottom: 24 }} />
        <div className="skeleton-box" style={{ width: '100%', height: 220, borderRadius: '50%' }} />
      </div>
    </div>

    {/* Recent activity skeleton */}
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
      <div className="skeleton-box" style={{ width: 200, height: 22, marginBottom: 20 }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 16 }}>
          <div className="skeleton-box" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-box" style={{ width: '60%', height: 16, marginBottom: 6 }} />
            <div className="skeleton-box" style={{ width: '40%', height: 12 }} />
          </div>
          <div className="skeleton-box" style={{ width: 80, height: 24, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, defaultPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // ✅ Show skeleton instead of blank spinner
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.some((r) => user.roles.includes(r))) {
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;