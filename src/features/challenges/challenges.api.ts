import { apiClient } from '@/lib/apiClient';
import type {
  Challenge,
  ChallengePage,
  CreateChallengePayload,
  ListChallengesQuery,
  UpdateChallengePayload,
} from './challenges.types';

/**
 * Challenge CRUD API. `cleanParams` drops empty query keys but keeps boolean
 * `false` so `is_active=false` filters work. DELETE returns 204 (empty body),
 * which the apiClient interceptor tolerates, so `deleteChallenge` resolves void.
 */

function cleanParams(query: ListChallengesQuery): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number | boolean;
    }
  }
  return out;
}

/** GET /admin/challenges — paginated, filterable challenge list. */
export async function listChallenges(query: ListChallengesQuery = {}): Promise<ChallengePage> {
  const response = await apiClient.get<ChallengePage>('/admin/challenges', {
    params: cleanParams(query),
  });
  return response.data;
}

/** POST /admin/challenges — create a challenge. */
export async function createChallenge(body: CreateChallengePayload): Promise<Challenge> {
  const response = await apiClient.post<Challenge>('/admin/challenges', body);
  return response.data;
}

/** PATCH /admin/challenges/:id — edit or soft-delete (`is_active:false`). */
export async function updateChallenge(
  id: string,
  body: UpdateChallengePayload,
): Promise<Challenge> {
  const response = await apiClient.patch<Challenge>(`/admin/challenges/${id}`, body);
  return response.data;
}

/** DELETE /admin/challenges/:id — hard delete (cascades player progress). */
export async function deleteChallenge(id: string): Promise<void> {
  await apiClient.delete(`/admin/challenges/${id}`);
}
