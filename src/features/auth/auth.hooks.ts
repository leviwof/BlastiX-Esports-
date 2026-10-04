import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearToken, setToken } from '@/lib/apiClient';
import { ApiError } from '@/lib/apiError';
import { adminPasswordLogin, login, sendOtp } from './auth.api';
import { useAuthStore } from './auth.store';
import { type AdminPasswordLoginRequest, type AdminUser, type LoginRequest, isAdmin, toAdminUser } from './auth.types';
import { DEV_ADMIN, DEV_LOGIN_ENABLED, DEV_TOKEN } from './devAuth';

/** Request an OTP email for the given address. */
export function useSendOtp() {
  return useMutation<void, unknown, string>({
    mutationFn: (email: string) => sendOtp({ email }),
  });
}

/**
 * Verify an email + OTP and, only for an admin, establish the session:
 * store the JWT and populate the auth store. A successful login by a
 * non-admin (or one that returns no token) is rejected without storing
 * anything, so the panel never grants access to a non-admin account.
 */
export function useLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  return useMutation<AdminUser, unknown, LoginRequest>({
    mutationFn: async (body) => {
      const user = await login(body);
      if (!isAdmin(user)) {
        // Authenticated, but not an admin — deny access, keep no credentials.
        throw new ApiError('This account does not have admin access.', { status: 403 });
      }
      if (!user.token) {
        throw new ApiError('The server did not return a session token. Please try again.');
      }
      setToken(user.token);
      const admin = toAdminUser(user);
      setAuthenticated(admin);
      return admin;
    },
  });
}

/** Authenticate an administrator with the server-configured email and password. */
export function useAdminPasswordLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  return useMutation<AdminUser, unknown, AdminPasswordLoginRequest>({
    mutationFn: async (body) => {
      const user = await adminPasswordLogin(body);
      if (!isAdmin(user)) {
        throw new ApiError('This account does not have admin access.', { status: 403 });
      }
      if (!user.token) {
        throw new ApiError('The server did not return a session token. Please try again.');
      }
      setToken(user.token);
      const admin = toAdminUser(user);
      setAuthenticated(admin);
      return admin;
    },
  });
}

/**
 * DEV-ONLY: establish an admin session without OTP for local UI review. No-op
 * unless the dev bypass is enabled ({@link DEV_LOGIN_ENABLED}). It stores the
 * sentinel token and flips the store to authenticated; the LoginPage guard then
 * redirects into the app. The backend does not accept the sentinel token, so
 * live data still requires a real session.
 */
export function useDevLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  return useCallback(() => {
    if (!DEV_LOGIN_ENABLED) return;
    setToken(DEV_TOKEN);
    setAuthenticated(DEV_ADMIN);
  }, [setAuthenticated]);
}

/**
 * Log out entirely on the client: clear the stored JWT, reset the auth store,
 * drop cached queries, and return to /login. There is no backend logout
 * endpoint in the contract, so nothing is sent to the server.
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);

  return useCallback(() => {
    clearToken();
    setUnauthenticated();
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [navigate, queryClient, setUnauthenticated]);
}
