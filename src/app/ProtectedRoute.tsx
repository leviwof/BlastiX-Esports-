import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStatus } from '@/features/auth/auth.store';
import { AuthSplash } from '@/components/shared/AuthSplash';

/**
 * Route guard for the admin area:
 * - `initializing` → splash (don't render the app before auth resolves).
 * - `authenticated` → render the nested routes.
 * - `unauthenticated` → redirect to /login, remembering where we came from so
 *   login can send the user back after signing in.
 */
function ProtectedRoute() {
  const status = useAuthStatus();
  const location = useLocation();

  if (status === 'initializing') {
    return <AuthSplash />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
