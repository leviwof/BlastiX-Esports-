import { apiClient } from '@/lib/apiClient';
import type { Game } from './games.types';

/**
 * Games API — the platform's catalogue of playable games. The response
 * interceptor unwraps the `{ status, data }` envelope, so `response.data` is the
 * `Game[]` payload; failures reject with a typed `ApiError`.
 */

/** GET /games — list supported games (public). */
export async function listGames(): Promise<Game[]> {
  const response = await apiClient.get<Game[]>('/games');
  return response.data;
}
