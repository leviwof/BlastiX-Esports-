import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getStats } from './stats.api';

/** GET /admin/stats — aggregate dashboard KPIs. */
export function useStats() {
  return useQuery({ queryKey: queryKeys.stats, queryFn: getStats });
}
