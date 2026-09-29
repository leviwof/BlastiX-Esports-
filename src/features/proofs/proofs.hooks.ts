import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { approveProof, listProofs, rejectProof } from './proofs.api';
import type { ListProofsQuery } from './proofs.types';

/**
 * Proof-review hooks. Approve / reject both invalidate the whole `['proofs']`
 * surface so the reviewed item leaves the pending queue immediately.
 */

const onMutationError = (error: unknown) => toast.error(getErrorMessage(error));

export function useProofs(query: ListProofsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.proofs(query as Record<string, unknown>),
    queryFn: () => listProofs(query),
    placeholderData: (prev) => prev,
  });
}

export function useApproveProof() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveProof(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['proofs'] });
      toast.success('Proof approved! Reward XP credited to player.');
    },
    onError: onMutationError,
  });
}

export function useRejectProof() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectProof(id, { reason }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['proofs'] });
      toast.success('Proof rejected.');
    },
    onError: onMutationError,
  });
}
