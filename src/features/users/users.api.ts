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
