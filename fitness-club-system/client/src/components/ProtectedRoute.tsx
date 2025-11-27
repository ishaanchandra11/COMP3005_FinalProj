import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('member' | 'trainer' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token, loadUser, isLoading } = useAuth();
  const hasTriedLoad = useRef(false);

  useEffect(() => {
    // Load user if we have a token but no user (e.g., on page refresh)
    // Only try once to avoid infinite loops
    if (token && !user && !hasTriedLoad.current) {
      hasTriedLoad.current = true;
      loadUser();
    }
  }, [token, user, loadUser]);

  // Show loading while checking auth
  if (isLoading || (token && !user && hasTriedLoad.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

