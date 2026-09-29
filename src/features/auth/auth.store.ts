import { create } from 'zustand';
import type { AdminUser, AuthStatus } from './auth.types';

interface AuthState {
  /** Current auth resolution state. Starts `initializing` until bootstrap runs. */
  status: AuthStatus;
  /** The signed-in admin, or null when not authenticated. */
  admin: AdminUser | null;
  /** Mark a verified admin session as active. */
  setAuthenticated: (admin: AdminUser) => void;
  /** Drop any session (no token, not signed in). */
  setUnauthenticated: () => void;
  /** Return to the pre-resolution state (used when a fresh bootstrap starts). */
  setInitializing: () => void;
}

/**
 * Global auth/session store. Kept deliberately small: transport concerns (the
 * JWT itself) live in the apiClient/localStorage; this holds only the resolved
 * UI state. Session restoration is driven by {@link AuthBootstrap}.
 */
export const useAuthStore = create<AuthState>((set) => ({
  status: 'initializing',
  admin: null,
  setAuthenticated: (admin) => set({ status: 'authenticated', admin }),
  setUnauthenticated: () => set({ status: 'unauthenticated', admin: null }),
  setInitializing: () => set({ status: 'initializing' }),
}));

/** Selector: current auth status. */
export const useAuthStatus = (): AuthStatus => useAuthStore((s) => s.status);

/** Selector: the signed-in admin (or null). */
export const useAdmin = (): AdminUser | null => useAuthStore((s) => s.admin);
