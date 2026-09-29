import { apiClient } from '@/lib/apiClient';
import type { ListTeamsQuery, TeamDetail, TeamPage } from './teams.types';

/**
 * Teams API — read-only admin views (teams are created by players). The
 * response interceptor already unwraps the `{ status, data }` envelope, so
 * `response.data` here is the inner payload; failures reject with a typed
 * `ApiError`. Strict backend validation rejects unknown query keys.
 */

/** Drop undefined/empty values so we never send stray query keys (→ 400). */
function cleanParams(query: ListTeamsQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number;
    }
  }
  return out;
}

/** GET /admin/teams — paginated, searchable team list. */
export async function listTeams(query: ListTeamsQuery = {}): Promise<TeamPage> {
  const response = await apiClient.get<TeamPage>('/admin/teams', { params: cleanParams(query) });
  return response.data;
}

/** GET /admin/teams/:id — team detail + roster. */
export async function getTeam(id: string): Promise<TeamDetail> {
  const response = await apiClient.get<TeamDetail>(`/admin/teams/${id}`);
  return response.data;
}
