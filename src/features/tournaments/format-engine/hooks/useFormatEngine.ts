import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatEngineApi } from '../api/formatEngine.api';
import type { FormatCalculateRequest } from '../types/formatEngine.types';

export function useFormatEngine(params: FormatCalculateRequest, enabled = true) {
  const [debouncedParams, setDebouncedParams] = useState(params);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(params);
    }, 280); // 280ms debounce for responsive typing

    return () => clearTimeout(timer);
  }, [params.mode, params.capacity, params.maxRounds, params.exactRounds]);

  const query = useQuery({
    queryKey: ['format-engine-calculate', debouncedParams],
    queryFn: () => formatEngineApi.calculateFormat(debouncedParams),
    enabled: enabled && debouncedParams.capacity > 0 && !!debouncedParams.mode,
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    ...query,
    isDebouncing: params.capacity !== debouncedParams.capacity,
  };
}
