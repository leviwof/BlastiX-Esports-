import { apiClient } from '@/lib/apiClient';
import type { AppConfig, UpdateConfigPayload } from './config.types';

/**
 * App-config API. Reads use the public `GET /config/init` (there is no admin
 * GET); writes use `PATCH /admin/config`. The response envelope is unwrapped by
 * the apiClient interceptor, so `response.data` is the config payload.
 */

/** GET /config/init — current app configuration. */
export async function getConfig(): Promise<AppConfig> {
  const response = await apiClient.get<AppConfig>('/config/init');
  return response.data;
}

/** PATCH /admin/config — update maintenance flags and version gates. */
export async function updateConfig(body: UpdateConfigPayload): Promise<AppConfig> {
  const response = await apiClient.patch<AppConfig>('/admin/config', body);
  return response.data;
}
