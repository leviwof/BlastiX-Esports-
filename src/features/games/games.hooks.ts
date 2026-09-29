import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { listGames } from './games.api';

/**
 * Games hook — the supported-games catalogue. Rarely changes, so it is cached
 * generously and reused by selectors (e.g. the tournament create form).
 */
export function useGames() {
  return useQuery({
    queryKey: queryKeys.games,
    queryFn: listGames,
    staleTime: 5 * 60 * 1000,
  });
}
