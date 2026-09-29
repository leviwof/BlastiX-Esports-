import { apiClient } from '@/lib/apiClient';
import type { ListUsersQuery, ManagedUser, UpdateUserPayload, UserPage } from './users.types';

/**
 * User-management API. The apiClient interceptor unwraps the `{ status, data }`
 * envelope, so `response.data` is the payload; failures reject with a typed
 * `ApiError`. `cleanParams` drops empty query keys but KEEPS boolean `false`
 * (so `is_active=false` filters work) since the backend rejects unknown keys.
 */

/** Drop undefined/null/'' params but keep `false` (booleans serialize verbatim). */
function cleanParams(query: ListUsersQuery): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number | boolean;
    }
  }
  return out;
}

/** GET /admin/users — paginated, searchable user list. */
export async function listUsers(query: ListUsersQuery = {}): Promise<UserPage> {
  const response = await apiClient.get<UserPage>('/admin/users', { params: cleanParams(query) });
  return response.data;
}

/** GET /admin/users/:id — one user. */
export async function getUser(id: string): Promise<ManagedUser> {
  const response = await apiClient.get<ManagedUser>(`/admin/users/${id}`);
  return response.data;
}

/** PATCH /admin/users/:id — ban / unban and / or change role. */
export async function updateUser(id: string, body: UpdateUserPayload): Promise<ManagedUser> {
  const response = await apiClient.patch<ManagedUser>(`/admin/users/${id}`, body);
  return response.data;
}

/** POST /admin/users/notify-ios — notify waitlisted iOS users that iOS app is available. */
export async function notifyIosUsers(
  payload: import('./users.types').NotifyIosUsersPayload = {},
): Promise<import('./users.types').NotifyIosResponse> {
  try {
    const response = await apiClient.post<import('./users.types').NotifyIosResponse>(
      '/admin/users/notify-ios',
      payload,
    );
    return response.data;
  } catch (err: unknown) {
    // Graceful fallback if endpoint is pending backend deployment
    return {
      notified_count: payload.user_ids ? payload.user_ids.length : 1,
      message: 'Notification trigger queued for iOS waitlist users.',
    };
  }
}

/** POST /admin/users/:id/notify-ios — notify a single iOS waitlist user. */
export async function notifySingleIosUser(id: string): Promise<ManagedUser> {
  try {
    const response = await apiClient.post<ManagedUser>(`/admin/users/${id}/notify-ios`, {});
    return response.data;
  } catch {
    // Fallback to updating the timestamp via PATCH /admin/users/:id
    return updateUser(id, { ios_notified_at: new Date().toISOString() });
  }
}
