import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getTeam, listTeams } from './teams.api';
import type { ListTeamsQuery } from './teams.types';

/**
 * Read-only team hooks (list + detail). No mutations — the admin panel doesn't
 * write teams; moderation happens through the tournament disqualify flow.
 */

export function useTeams(query: ListTeamsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.teams(query as Record<string, unknown>),
    queryFn: () => listTeams(query),
    placeholderData: (prev) => prev, // keep the previous page visible while paging
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.team(id ?? ''),
    queryFn: () => getTeam(id as string),
    enabled: Boolean(id),
  });
}
