import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as bracketsApi from '../api/brackets.api';
import type {
  OpenWildCardPayload,
  AssignWildCardSlotPayload,
  ResolveTieBreakerPayload,
  FillGrandFinalSlotPayload,
  AssembleGrandFinalPayload,
  SetGroupRoomCredentialsPayload,
  SubmitGroupScoresPayload,
} from '../types/brackets.types';

export const bracketKeys = {
  all: ['brackets'] as const,
  rounds: (tournamentId: string) => [...bracketKeys.all, 'rounds', tournamentId] as const,
  wildcard: (tournamentId: string) => [...bracketKeys.all, 'wildcard', tournamentId] as const,
  tieBreakers: (tournamentId: string) => [...bracketKeys.all, 'tie-breakers', tournamentId] as const,
};

// ==========================================
// QUERIES
// ==========================================

export function useTournamentRounds(tournamentId: string) {
  return useQuery({
    queryKey: bracketKeys.rounds(tournamentId),
    queryFn: () => bracketsApi.getTournamentRounds(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useWildCardStatus(tournamentId: string) {
  return useQuery({
    queryKey: bracketKeys.wildcard(tournamentId),
    queryFn: () => bracketsApi.getWildCardSlots(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function usePendingTieBreakers(tournamentId: string) {
  return useQuery({
    queryKey: bracketKeys.tieBreakers(tournamentId),
    queryFn: () => bracketsApi.getPendingTieBreakers(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useGenerateRound1(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.generateRound1(tournamentId),
    onSuccess: () => {
      toast.success('Round 1 generated! 96 teams partitioned into 8 groups.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to generate Round 1');
    },
  });
}

export function useAdvanceRound1(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.advanceRound1(tournamentId),
    onSuccess: (res) => {
      if (res.status === 'TIE_BREAKER_PENDING') {
        toast.warning('Round advancement paused: Tie-breaker required at Rank 6 cutoff.');
        void queryClient.invalidateQueries({ queryKey: bracketKeys.tieBreakers(tournamentId) });
      } else {
        toast.success(res.message || 'Round 1 completed! 48 teams advanced to Round 2.');
      }
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to advance Round 1');
    },
  });
}

export function useAdvanceRound2(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.advanceRound2(tournamentId),
    onSuccess: (res) => {
      if (res.status === 'TIE_BREAKER_PENDING') {
        toast.warning('Round advancement paused: Tie-breaker required.');
        void queryClient.invalidateQueries({ queryKey: bracketKeys.tieBreakers(tournamentId) });
      } else {
        toast.success(res.message || 'Round 2 completed! 8 Finalists + 28 Round 3 qualifiers.');
      }
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to advance Round 2');
    },
  });
}

export function useOpenWildCard(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: OpenWildCardPayload) => bracketsApi.openWildCard(tournamentId, payload),
    onSuccess: () => {
      toast.success('Wild Card registration window is now OPEN.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.wildcard(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to open Wild Card registration');
    },
  });
}

export function useCloseWildCard(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.closeWildCard(tournamentId),
    onSuccess: () => {
      toast.success('Wild Card registration window is now LOCKED.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.wildcard(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to lock Wild Card registration');
    },
  });
}

export function useAssignWildCardSlot(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignWildCardSlotPayload) => bracketsApi.assignWildCardSlot(tournamentId, payload),
    onSuccess: () => {
      toast.success('Team successfully assigned to Wild Card slot.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.wildcard(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to assign Wild Card slot');
    },
  });
}

export function useRemoveWildCardSlot(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotNumber: number) => bracketsApi.removeWildCardSlot(tournamentId, slotNumber),
    onSuccess: () => {
      toast.success('Wild Card slot removed.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.wildcard(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to remove Wild Card slot');
    },
  });
}

export function useGenerateRound3(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.generateRound3(tournamentId),
    onSuccess: () => {
      toast.success('Round 3 generated! 36 teams seeded into 3 groups.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
      void queryClient.invalidateQueries({ queryKey: bracketKeys.wildcard(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to generate Round 3');
    },
  });
}

export function useAdvanceRound3(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bracketsApi.advanceRound3(tournamentId),
    onSuccess: (res) => {
      if (res.status === 'TIE_BREAKER_PENDING') {
        toast.warning('Round advancement paused: Tie-breaker required at Rank 3 cutoff.');
        void queryClient.invalidateQueries({ queryKey: bracketKeys.tieBreakers(tournamentId) });
      } else {
        toast.success(res.message || 'Round 3 completed! 9 teams advanced to Grand Final.');
      }
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to advance Round 3');
    },
  });
}

export function useAssembleGrandFinal(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: AssembleGrandFinalPayload) => bracketsApi.assembleGrandFinal(tournamentId, payload),
    onSuccess: (res: any) => {
      if (res.status === 'PENDING_SLOTS') {
        toast.warning(res.message);
      } else {
        toast.success('Grand Final assembled with 18 locked teams!');
      }
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to assemble Grand Final');
    },
  });
}

export function useFillGrandFinalSlot(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FillGrandFinalSlotPayload) => bracketsApi.fillGrandFinalSlot(tournamentId, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Team added to Grand Final.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to fill Grand Final slot');
    },
  });
}

export function useResolveTieBreaker(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tieBreakerId, payload }: { tieBreakerId: string; payload: ResolveTieBreakerPayload }) =>
      bracketsApi.resolveTieBreaker(tournamentId, tieBreakerId, payload),
    onSuccess: () => {
      toast.success('Tie-breaker resolved! Advancement auto-resumed.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.tieBreakers(tournamentId) });
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to resolve tie-breaker');
    },
  });
}

export function useUpdateRoomCredentials(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: SetGroupRoomCredentialsPayload }) =>
      bracketsApi.updateGroupRoomCredentials(tournamentId, groupId, payload),
    onSuccess: () => {
      toast.success('Group room credentials updated and published.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update group room credentials');
    },
  });
}

export function useSubmitGroupScores(tournamentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: SubmitGroupScoresPayload }) =>
      bracketsApi.submitGroupScores(tournamentId, groupId, payload),
    onSuccess: () => {
      toast.success('Group match scores submitted and standings recalculated.');
      void queryClient.invalidateQueries({ queryKey: bracketKeys.rounds(tournamentId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit group scores');
    },
  });
}
