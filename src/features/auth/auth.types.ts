/**
 * Auth domain types — kept to the fields the admin panel's auth layer actually
 * uses. The backend `UserResponse` carries more (stats, game_profile, …); those
 * are intentionally omitted here since the auth flow doesn't need them.
 *
 * Verified against the deployed backend (NestJS): the documented admin auth
 * endpoints in the brief (`/admin/auth/login`, `/admin/auth/me`) do NOT exist.
 * The admin panel uses its admin-only password login; player OTP auth remains:
 *   POST /auth/send-otp  { email }            → { sent: true }
 *   POST /auth/login     { email, otp }        → UserResponse (incl. JWT `token`)
 *   POST /auth/admin-login { email, password } → UserResponse (admin only)
 *   GET  /users/me       (Bearer JWT)          → UserResponse
 * Admin access = `role === 'ADMIN'` (the backend maps non-admins to 'PLAYER').
 */

/** Role string that grants admin-panel access. */
export const ADMIN_ROLE = 'ADMIN' as const;

/**
 * Subset of the backend `UserResponse` the auth layer reads. Extra response
 * fields are ignored (not typed) because auth doesn't depend on them.
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Profile image URL, or null when unset. */
  profile_pic: string | null;
  is_active: boolean;
  /** JWT — present on the login response only, absent from GET /users/me. */
  token?: string;
}

/** Normalized admin identity used throughout the UI. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Avatar image URL, or null → render initials fallback. */
  avatarUrl: string | null;
}

/** POST /auth/send-otp request body. */
export interface SendOtpRequest {
  email: string;
}

/** POST /auth/login request body for player OTP auth. */
export interface LoginRequest {
  email: string;
  otp: string;
}

/** POST /auth/admin-login request body. */
export interface AdminPasswordLoginRequest {
  email: string;
  password: string;
}

/**
 * Auth resolution state:
 * - `initializing`: session restore in flight — render a splash, not the app.
 * - `authenticated`: a verified admin session exists.
 * - `unauthenticated`: no session — protected routes redirect to /login.
 */
export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

/** Map a backend user payload to the normalized {@link AdminUser}. */
export function toAdminUser(user: UserResponse): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.profile_pic ?? null,
  };
}

/** Whether a user payload has admin-panel access. */
export function isAdmin(user: Pick<UserResponse, 'role'>): boolean {
  return user.role === ADMIN_ROLE;
}
