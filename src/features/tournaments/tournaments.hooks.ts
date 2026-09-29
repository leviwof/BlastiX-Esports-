import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import {
  createMatch,
  createTournament,
  disqualifyRegistration,
  finalizeTournament,
  getLeaderboard,
  getMatches,
  getParticipants,
  getTournament,
  getTournaments,
  recordMatchResults,
  setRoomCredentials,
  updateTournament,
  updateTournamentStatus,
} from './tournaments.api';
import type {
  CreateMatchPayload,
  CreateTournamentPayload,
  DisqualifyPayload,
  FilterTournamentQuery,
  RecordResultsPayload,
  SetRoomPayload,
  UpdateStatusPayload,
  UpdateTournamentPayload,
} from './tournaments.types';

/**
 * TanStack Query hooks for the tournaments feature. Reads are cached under the
 * shared query keys; writes invalidate the affected keys so the UI refreshes
 * automatically. A tournament's detail key is a prefix of its participants /
 * matches / leaderboard keys, so invalidating ['tournament', id] refreshes all
 * of them at once. Errors surface a single toast here (call sites add
 * navigation / dialog-close in their own mutate options).
 */

/* -------------------------------------------------------------------- reads */

export function useTournaments(filters: FilterTournamentQuery = {}) {
  return useQuery({
    queryKey: queryKeys.tournaments(filters as Record<string, unknown>),
    queryFn: () => getTournaments(filters),
    placeholderData: (prev) => prev, // keep the previous page visible while paging
  });
}

export function useTournament(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournament(id ?? ''),
    queryFn: () => getTournament(id as string),
    enabled: Boolean(id),
  });
}

export function useParticipants(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentParticipants(id ?? ''),
    queryFn: () => getParticipants(id as string),
    enabled: Boolean(id),
  });
}

export function useMatches(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentMatches(id ?? ''),
    queryFn: () => getMatches(id as string),
    enabled: Boolean(id),
  });
}

export function useLeaderboard(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentLeaderboard(id ?? ''),
    queryFn: () => getLeaderboard(id as string),
    enabled: Boolean(id),
  });
}

/* -------------------------------------------------------------- write utils */

/** Invalidate a single tournament (and its sub-resources) plus the list. */
function invalidateTournament(client: QueryClient, id: string): void {
  void client.invalidateQueries({ queryKey: queryKeys.tournament(id) });
  void client.invalidateQueries({ queryKey: ['tournaments'] });
}

const onMutationError = (error: unknown) => toast.error(getErrorMessage(error));

/* ---------------------------------------------------------------- mutations */

/** POST /admin/tournaments — create a tournament. */
export function useCreateTournament() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTournamentPayload) => createTournament(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Tournament created');
    },
    onError: onMutationError,
  });
}

/** PATCH /admin/tournaments/:id — edit a tournament. */
export function useUpdateTournament(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTournamentPayload) => updateTournament(id, body),
    onSuccess: () => {
      invalidateTournament(client, id);
      toast.success('Tournament updated');
    },
    onError: onMutationError,
  });
}

/** POST /admin/tournaments/:id/status — change status (NOT a PATCH). */
export function useUpdateTournamentStatus(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateStatusPayload) => updateTournamentStatus(id, body),
    onSuccess: (_data, variables) => {
      invalidateTournament(client, id);
      toast.success(
        variables.status === 'CANCELLED' ? 'Tournament cancelled' : 'Status updated',
      );
    },
    onError: onMutationError,
  });
}

/** POST /admin/tournaments/:id/room — set / release room credentials. */
export function useSetRoomCredentials(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: SetRoomPayload) => setRoomCredentials(id, body),
    onSuccess: (_data, variables) => {
      invalidateTournament(client, id);
      toast.success(variables.release_now ? 'Room credentials released' : 'Room credentials saved');
    },
    onError: onMutationError,
  });
}

/** POST /admin/tournaments/:id/disqualify — disqualify a registration. */
export function useDisqualifyRegistration(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: DisqualifyPayload) => disqualifyRegistration(id, body),
    onSuccess: () => {
      invalidateTournament(client, id);
      toast.success('Participant disqualified');
    },
    onError: onMutationError,
  });
}

/** POST /admin/tournaments/:id/matches — create a match. */
export function useCreateMatch(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMatchPayload) => createMatch(id, body),
    onSuccess: () => {
      invalidateTournament(client, id);
      toast.success('Match created');
    },
    onError: onMutationError,
  });
}

/**
 * POST /admin/matches/:matchId/results — bulk record results. Needs the parent
 * tournament id too so it can refresh that tournament's matches + leaderboard.
 */
export function useRecordMatchResults(tournamentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, body }: { matchId: string; body: RecordResultsPayload }) =>
      recordMatchResults(matchId, body),
    onSuccess: () => {
      invalidateTournament(client, tournamentId);
      toast.success('Results recorded');
    },
    onError: onMutationError,
  });
}

/** POST /admin/tournaments/:id/finalize — finalize standings. */
export function useFinalizeTournament(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => finalizeTournament(id),
    onSuccess: () => {
      invalidateTournament(client, id);
      toast.success('Tournament finalized');
    },
    onError: onMutationError,
  });
}
