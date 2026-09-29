import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import {
  createChallenge,
  deleteChallenge,
  listChallenges,
  updateChallenge,
} from './challenges.api';
import type {
  CreateChallengePayload,
  ListChallengesQuery,
  UpdateChallengePayload,
} from './challenges.types';

/**
 * Challenge query + mutation hooks. All mutations invalidate the whole
 * `['challenges']` list surface (prefix match) so every active filter view
 * refreshes, and surface backend errors through the shared toast handler.
 */

const onMutationError = (error: unknown) => toast.error(getErrorMessage(error));

export function useChallenges(query: ListChallengesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.challenges(query as Record<string, unknown>),
    queryFn: () => listChallenges(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateChallenge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChallengePayload) => createChallenge(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge created');
    },
    onError: onMutationError,
  });
}

export function useUpdateChallenge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateChallengePayload }) =>
      updateChallenge(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteChallenge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChallenge(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge deleted');
    },
    onError: onMutationError,
  });
}
