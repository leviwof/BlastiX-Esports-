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

export const DEVICE_TYPES = ['ANDROID', 'IOS', 'WEB'] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number] | 'UNKNOWN';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  profile_pic: string | null;
  is_vip?: boolean;
  crown_badge_unlocked?: boolean;
  /** Backend enum, mapped to PLAYER | ADMIN — typed wide (like tournament status) for safety. */
  role: string;
  is_active: boolean;
  xp: number;
  rank: number;
  created_at: string;
  updated_at: string;

  /** Device platform detected or reported on login/registration. */
  device_type?: DeviceType | string | null;
  /** Device model (e.g. "iPhone 15 Pro", "Samsung S24 Ultra", "Pixel 8"). */
  device_model?: string | null;
  /** Operating system version (e.g. "iOS 17.5", "Android 14"). */
  os_version?: string | null;
  /** Client application version (e.g. "1.0.4"). */
  app_version?: string | null;
  /** True if user registered on iOS/iPhone and is waiting for iOS app availability. */
  ios_waitlist?: boolean | null;
  /** Timestamp when notification was sent to this user about iOS availability. */
  ios_notified_at?: string | null;
}

export type UserPage = Paginated<ManagedUser>;

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  /** Matches name OR email (server-side, case-insensitive). */
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  /** Filter by device type (ANDROID, IOS, WEB). */
  device_type?: string;
  /** Filter specifically for users on the iOS waitlist. */
  ios_waitlist?: boolean;
}

/** PATCH /admin/users/:id — ban / unban, role change, and/or device status. */
export interface UpdateUserPayload {
  is_active?: boolean;
  is_vip?: boolean;
  crown_badge_unlocked?: boolean;
  role?: UserRole;
  device_type?: string;
  ios_waitlist?: boolean;
  ios_notified_at?: string | null;
}

export interface NotifyIosUsersPayload {
  user_ids?: string[];
  subject?: string;
  message?: string;
}

export interface NotifyIosResponse {
  notified_count: number;
  message: string;
}
