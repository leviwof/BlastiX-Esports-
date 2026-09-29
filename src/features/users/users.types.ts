import type { Paginated } from '@/types/api';

/**
 * User-management domain types — mirror the `GET/PATCH /admin/users` contract.
 * The panel-facing entity is `ManagedUser` (the name `AdminUser` is already
 * taken by the authenticated-admin type in `auth.types.ts`). The backend maps
 * its DB `USER` role to `PLAYER` on the way out and back, so the panel only ever
 * sees / sends `PLAYER` | `ADMIN`.
 */

export const USER_ROLES = ['PLAYER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  profile_pic: string | null;
  /** Backend enum, mapped to PLAYER | ADMIN — typed wide (like tournament status) for safety. */
  role: string;
  is_active: boolean;
  xp: number;
  rank: number;
  created_at: string;
  updated_at: string;
}

export type UserPage = Paginated<ManagedUser>;

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  /** Matches name OR email (server-side, case-insensitive). */
  search?: string;
  role?: UserRole;
  is_active?: boolean;
}

/** PATCH /admin/users/:id — ban / unban (is_active) and / or role change. */
export interface UpdateUserPayload {
  is_active?: boolean;
  role?: UserRole;
}
