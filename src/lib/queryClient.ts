import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiError';

/**
 * Shared TanStack Query client.
 *
 * Defaults tuned for an admin panel talking to a REST backend:
 * - `staleTime` 30s so quick navigations don't refetch constantly.
 * - `refetchOnWindowFocus` off — admin data isn't realtime; manual refresh/
 *   mutations invalidate what matters.
 * - a single retry for reads, but never retry a 4xx (auth/validation errors
 *   won't fix themselves) and never retry mutations (avoid double-writes).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
