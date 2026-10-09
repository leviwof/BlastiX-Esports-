import { useQuery } from '@tanstack/react-query';
import { getGlobalLeaderboard } from '../api/leaderboard.api';
import type { GlobalLeaderboardQuery } from '../types/leaderboard.types';

export const leaderboardKeys = {
  all: ['global-leaderboard'] as const,
  players: (query: GlobalLeaderboardQuery) =>
    [...leaderboardKeys.all, 'players', query] as const,
};

export function useGlobalLeaderboard(query: GlobalLeaderboardQuery = {}) {
  return useQuery({
    queryKey: leaderboardKeys.players(query),
    queryFn: () => getGlobalLeaderboard(query),
    placeholderData: (prev) => prev,
  });
}
