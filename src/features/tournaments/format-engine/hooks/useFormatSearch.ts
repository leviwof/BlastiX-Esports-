import { useQuery } from '@tanstack/react-query';
import { formatEngineApi } from '../api/formatEngine.api';
import type { FormatSearchRequest } from '../types/formatEngine.types';

export function useFormatSearch(params: FormatSearchRequest, enabled = true) {
  return useQuery({
    queryKey: ['format-engine-search', params],
    queryFn: () => formatEngineApi.searchFormats(params),
    enabled: enabled && !!params.mode,
    staleTime: 60 * 1000,
  });
}
