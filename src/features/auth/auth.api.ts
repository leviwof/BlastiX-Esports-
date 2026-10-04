import { apiClient } from '@/lib/apiClient';
import type { AdminPasswordLoginRequest, LoginRequest, SendOtpRequest, UserResponse } from './auth.types';

/**
 * Auth API — thin typed wrappers over the verified backend endpoints.
 *
 * The apiClient response interceptor already unwraps the `{ status, data }`
 * envelope, so `response.data` here is the inner payload. Failures reject with
 * a typed `ApiError` from the client's error interceptor.
 */

/** POST /auth/send-otp — email a one-time login code. Rate-limited (→ 429). */
export async function sendOtp(body: SendOtpRequest): Promise<void> {
  await apiClient.post('/auth/send-otp', body);
}

/**
 * POST /auth/login — exchange email + 6-digit OTP for a session. Resolves to
 * the user payload including the JWT `token`. Rejects on invalid/expired OTP
 * (400) or inactive account (401).
 */
export async function login(body: LoginRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/auth/login', body);
  return response.data;
}

/** POST /auth/admin-login — exchange configured admin credentials for a session. */
export async function adminPasswordLogin(body: AdminPasswordLoginRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/auth/admin-login', body);
  return response.data;
}

/** GET /users/me — the current authenticated user (session restore + role gate). */
export async function getMe(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>('/users/me');
  return response.data;
}
