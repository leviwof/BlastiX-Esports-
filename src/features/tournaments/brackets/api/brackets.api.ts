import { apiClient } from '@/lib/apiClient';
import type {
  TournamentRound,
  WildCardWindow,
  TournamentTieBreaker,
  OpenWildCardPayload,
  AssignWildCardSlotPayload,
  ResolveTieBreakerPayload,
  FillGrandFinalSlotPayload,
  AssembleGrandFinalPayload,
  SetGroupRoomCredentialsPayload,
  SubmitGroupScoresPayload,
  TournamentGroup,
} from '../types/brackets.types';

// ==========================================
// TOURNAMENT ROUND READS & LIFECYCLE
// ==========================================

export async function getTournamentRounds(tournamentId: string): Promise<TournamentRound[]> {
  const response = await apiClient.get<TournamentRound[]>(`/admin/tournaments/${tournamentId}/rounds`);
  return response.data;
}

export async function generateRound1(tournamentId: string): Promise<TournamentRound> {
  const response = await apiClient.post<TournamentRound>(`/admin/tournaments/${tournamentId}/rounds/r1/generate`, {});
  return response.data;
}

export async function advanceRound1(tournamentId: string): Promise<{ status: string; round2?: TournamentRound; message?: string }> {
  const response = await apiClient.post<{ status: string; round2?: TournamentRound; message?: string }>(
    `/admin/tournaments/${tournamentId}/rounds/r1/advance`,
    {},
  );
  return response.data;
}

export async function advanceRound2(tournamentId: string): Promise<{ status: string; message?: string }> {
  const response = await apiClient.post<{ status: string; message?: string }>(
    `/admin/tournaments/${tournamentId}/rounds/r2/advance`,
    {},
  );
  return response.data;
}

export async function generateRound3(tournamentId: string): Promise<TournamentRound> {
  const response = await apiClient.post<TournamentRound>(`/admin/tournaments/${tournamentId}/rounds/r3/generate`, {});
  return response.data;
}

export async function advanceRound3(tournamentId: string): Promise<{ status: string; message?: string }> {
  const response = await apiClient.post<{ status: string; message?: string }>(
    `/admin/tournaments/${tournamentId}/rounds/r3/advance`,
    {},
  );
  return response.data;
}

export async function assembleGrandFinal(
  tournamentId: string,
  payload: AssembleGrandFinalPayload = {},
): Promise<TournamentRound | { status: string; currentCount: number; requiredCount: number; message: string }> {
  const response = await apiClient.post(
    `/admin/tournaments/${tournamentId}/rounds/grand-final/assemble`,
    payload,
  );
  return response.data;
}

export async function fillGrandFinalSlot(
  tournamentId: string,
  payload: FillGrandFinalSlotPayload,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/admin/tournaments/${tournamentId}/rounds/grand-final/fill-slot`,
    payload,
  );
  return response.data;
}

// ==========================================
// TIE BREAKER ENGINE
// ==========================================

export async function getPendingTieBreakers(tournamentId: string): Promise<TournamentTieBreaker[]> {
  const response = await apiClient.get<TournamentTieBreaker[]>(`/admin/tournaments/${tournamentId}/tie-breakers/pending`);
  return response.data;
}

export async function resolveTieBreaker(
  tournamentId: string,
  tieBreakerId: string,
  payload: ResolveTieBreakerPayload,
): Promise<{ success: boolean; resolvedTieBreaker: TournamentTieBreaker }> {
  const response = await apiClient.post<{ success: boolean; resolvedTieBreaker: TournamentTieBreaker }>(
    `/admin/tournaments/${tournamentId}/tie-breakers/${tieBreakerId}/resolve`,
    payload,
  );
  return response.data;
}

// ==========================================
// WILD CARD MANAGEMENT
// ==========================================

export async function openWildCard(
  tournamentId: string,
  payload: OpenWildCardPayload = {},
): Promise<WildCardWindow> {
  const response = await apiClient.post<WildCardWindow>(`/admin/tournaments/${tournamentId}/wildcard/open`, payload);
  return response.data;
}

export async function closeWildCard(tournamentId: string): Promise<WildCardWindow> {
  const response = await apiClient.post<WildCardWindow>(`/admin/tournaments/${tournamentId}/wildcard/close`, {});
  return response.data;
}

export async function getWildCardSlots(tournamentId: string): Promise<WildCardWindow> {
  const response = await apiClient.get<WildCardWindow>(`/admin/tournaments/${tournamentId}/wildcard/slots`);
  return response.data;
}

export async function assignWildCardSlot(
  tournamentId: string,
  payload: AssignWildCardSlotPayload,
): Promise<unknown> {
  const response = await apiClient.post(`/admin/tournaments/${tournamentId}/wildcard/slots/assign`, payload);
  return response.data;
}

export async function removeWildCardSlot(
  tournamentId: string,
  slotNumber: number,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/admin/tournaments/${tournamentId}/wildcard/slots/${slotNumber}`,
  );
  return response.data;
}

// ==========================================
// GROUP ROOM CREDENTIALS & MATCH SCORES
// ==========================================

export async function updateGroupRoomCredentials(
  tournamentId: string,
  groupId: string,
  payload: SetGroupRoomCredentialsPayload,
): Promise<TournamentGroup> {
  const response = await apiClient.patch<TournamentGroup>(
    `/admin/tournaments/${tournamentId}/groups/${groupId}/room-credentials`,
    payload,
  );
  return response.data;
}

export async function submitGroupScores(
  tournamentId: string,
  groupId: string,
  payload: SubmitGroupScoresPayload,
): Promise<TournamentGroup> {
  const response = await apiClient.post<TournamentGroup>(
    `/admin/tournaments/${tournamentId}/groups/${groupId}/scores`,
    payload,
  );
  return response.data;
}
