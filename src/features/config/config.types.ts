/**
 * App-config domain types — mirror `GET /config/init` (read) and
 * `PATCH /admin/config` (write). There is no admin GET, so the panel reads the
 * same public init endpoint the mobile clients use. Nullable fields come back
 * `null` when unset.
 */

export interface AppConfig {
  min_version: string;
  latest_version: string;
  is_maintenance: boolean;
  maintenance_message: string | null;
  update_url: string | null;
}

/** PATCH /admin/config — every field optional; omitted keys are left unchanged. */
export interface UpdateConfigPayload {
  is_maintenance?: boolean;
  maintenance_message?: string;
  min_version?: string;
  latest_version?: string;
  update_url?: string;
}
