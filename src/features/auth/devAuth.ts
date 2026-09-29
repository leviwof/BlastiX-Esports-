import { env } from '@/lib/env';
import type { AdminUser } from './auth.types';

/**
 * DEV-ONLY sign-in bypass, so the admin UI can be opened and navigated locally
 * without the passwordless email-OTP round-trip. Gated by {@link env.devLoginEnabled}
 * (dev server + `VITE_DEV_LOGIN=true`); a production build strips it entirely.
 *
 * IMPORTANT: this is a *client-side* convenience only. The sentinel token below
 * is NOT a real JWT — the deployed backend rejects it — so live data does not
 * load through a dev session (reads/writes fail as they would unauthenticated).
 * It unlocks the shell, navigation, forms, dialogs, and empty/error states for
 * review; it does not fabricate any backend data.
 */

/** Whether the dev sign-in bypass is available in this build. */
export const DEV_LOGIN_ENABLED = env.devLoginEnabled;

/** Sentinel stored in place of a JWT for a dev session (not accepted by the API). */
export const DEV_TOKEN = 'dev-bypass.not-a-real-jwt';

/** The fake admin identity a dev session is signed in as. */
export const DEV_ADMIN: AdminUser = {
  id: 'dev-admin',
  name: env.devAdminName,
  email: env.devAdminEmail,
  role: 'ADMIN',
  avatarUrl: null,
};

/** Whether a stored token is the dev sentinel (lets bootstrap skip the API). */
export function isDevToken(token: string | null): boolean {
  return DEV_LOGIN_ENABLED && token === DEV_TOKEN;
}
