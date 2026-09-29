import { useEffect } from 'react';
import { clearToken, getToken, setUnauthorizedHandler } from '@/lib/apiClient';
import { getMe } from './auth.api';
import { useAuthStore } from './auth.store';
import { isAdmin, toAdminUser } from './auth.types';
import { DEV_ADMIN, isDevToken } from './devAuth';

/**
 * Session restoration + global 401 wiring. Rendered once, high in the tree.
 *
 * On mount:
 *  1. Registers the apiClient's unauthorized handler so any 401 anywhere drops
 *     the session (the interceptor already cleared the token) → routes redirect
 *     to /login. No navigation happens here, avoiding redirect loops.
 *  2. If a token is stored, verifies it via GET /users/me and restores the
 *     session only for an admin; otherwise clears the token. No token → straight
 *     to unauthenticated. The store stays `initializing` until this resolves, so
 *     protected screens show a splash rather than flashing content.
 */
function AuthBootstrap() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Token already cleared by the interceptor; just resolve UI state.
      setUnauthenticated();
    });

    let cancelled = false;

    async function bootstrap(): Promise<void> {
      const token = getToken();
      if (!token) {
        setUnauthenticated();
        return;
      }
      // DEV-ONLY: a bypass session is restored locally without hitting the API
      // (the sentinel token isn't a real JWT). Never true in a production build.
      if (isDevToken(token)) {
        setAuthenticated(DEV_ADMIN);
        return;
      }
      try {
        const user = await getMe();
        if (cancelled) return;
        if (isAdmin(user)) {
          setAuthenticated(toAdminUser(user));
        } else {
          clearToken();
          setUnauthenticated();
        }
      } catch {
        // Invalid/expired token or transport failure — treat as signed out.
        if (cancelled) return;
        clearToken();
        setUnauthenticated();
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [setAuthenticated, setUnauthenticated]);

  return null;
}

export { AuthBootstrap };
