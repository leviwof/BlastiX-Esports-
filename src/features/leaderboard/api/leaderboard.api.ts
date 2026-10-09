import { apiClient } from '@/lib/apiClient';
import type { GlobalLeaderboardQuery, GlobalLeaderboardResponse } from '../types/leaderboard.types';

export async function getGlobalLeaderboard(
  query: GlobalLeaderboardQuery = {},
): Promise<GlobalLeaderboardResponse> {
  const cleanParams: Record<string, string | number> = {};
  if (query.page) cleanParams.page = query.page;
  if (query.limit) cleanParams.limit = query.limit;
  if (query.q) cleanParams.q = query.q;
  if (query.sortBy) cleanParams.sortBy = query.sortBy;

  const response = await apiClient.get<GlobalLeaderboardResponse>('/admin/users/leaderboard', {
    params: cleanParams,
  });
  return response.data;
}
