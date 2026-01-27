import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
