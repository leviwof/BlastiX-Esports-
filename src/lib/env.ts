const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

/**
 * Dev-only sign-in bypass. Active ONLY during a dev server run
 * (`import.meta.env.DEV`) AND when explicitly opted in with `VITE_DEV_LOGIN=true`.
 * A production build (`vite build`) sets `DEV` to false, so the whole feature is
 * dead-code-eliminated from the shipped bundle and can never be enabled there.
 */
const devLoginEnabled =
  import.meta.env.DEV && (import.meta.env.VITE_DEV_LOGIN ?? '').trim() === 'true';

const devAdminEmail = (import.meta.env.VITE_DEV_ADMIN_EMAIL ?? '').trim() || 'dev-admin@blastix.local';
const devAdminName = (import.meta.env.VITE_DEV_ADMIN_NAME ?? '').trim() || 'Dev Admin';

if (!apiBaseUrl && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn('[env] VITE_API_BASE_URL is not set — API calls will fail.');
}

export const env = {
  apiBaseUrl,
  devLoginEnabled,
  devAdminEmail,
  devAdminName,
} as const;
