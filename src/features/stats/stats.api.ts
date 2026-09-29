import { apiClient } from '@/lib/apiClient';
import type { AdminStats } from './stats.types';

/**
 * Stats API. The apiClient interceptor already unwraps the `{ status, data }`
 * envelope, so `response.data` is the aggregate payload; failures reject with a
 * typed `ApiError`.
 */

/** GET /admin/stats — aggregate dashboard counts. */
export async function getStats(): Promise<AdminStats> {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
}
