import { apiClient } from '@/lib/apiClient';
import type {
  CreateMatchPayload,
  CreateTournamentPayload,
  DisqualifyPayload,
  FilterTournamentQuery,
  FinalizeResult,
  LeaderboardEntry,
  Match,
  MatchResult,
  RecordResultsPayload,
  SetRoomPayload,
  Tournament,
  TournamentPage,
  TournamentRegistration,
  UpdateStatusPayload,
  UpdateTournamentPayload,
} from './tournaments.types';

/**
 * Tournament API — thin typed wrappers over the verified backend routes. The
 * apiClient response interceptor already unwraps the `{ status, data }`
 * envelope, so `response.data` here is the inner payload; failures reject with
 * a typed `ApiError`. Strict backend validation rejects unknown keys, so
 * no-body POSTs send `{}` and filter functions send only defined params.
 */

/** Drop undefined/empty values so we never send stray query keys (→ 400). */
function cleanParams(query: FilterTournamentQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number;
    }
  }
  return out;
}

/* ------------------------------------------------------------------- reads */

/** GET /tournaments — paginated list (public). */
export async function getTournaments(query: FilterTournamentQuery = {}): Promise<TournamentPage> {
  const response = await apiClient.get<TournamentPage>('/tournaments', { params: cleanParams(query) });
  return response.data;
}

/** GET /tournaments/:id — detail (room fields excluded by the backend). */
export async function getTournament(id: string): Promise<Tournament> {
  const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
  return response.data;
}

/** GET /tournaments/:id/participants — registrations. */
export async function getParticipants(id: string): Promise<TournamentRegistration[]> {
  const response = await apiClient.get<TournamentRegistration[]>(`/tournaments/${id}/participants`);
  return response.data;
}

/** GET /tournaments/:id/matches — matches (with results when present). */
export async function getMatches(id: string): Promise<Match[]> {
  const response = await apiClient.get<Match[]>(`/tournaments/${id}/matches`);
  return response.data;
}

/** GET /tournaments/:id/leaderboard — standings. */
export async function getLeaderboard(id: string): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get<LeaderboardEntry[]>(`/tournaments/${id}/leaderboard`);
  return response.data;
}

/* ------------------------------------------------------------ admin writes */

/** POST /admin/tournaments — create. Response includes room fields. */
export async function createTournament(body: CreateTournamentPayload): Promise<Tournament> {
  const response = await apiClient.post<Tournament>('/admin/tournaments', body);
  return response.data;
}

/** PATCH /admin/tournaments/:id — edit. */
export async function updateTournament(id: string, body: UpdateTournamentPayload): Promise<Tournament> {
  const response = await apiClient.patch<Tournament>(`/admin/tournaments/${id}`, body);
  return response.data;
}

/** POST /admin/tournaments/:id/status — set status (NOT a PATCH). */
export async function updateTournamentStatus(id: string, body: UpdateStatusPayload): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/admin/tournaments/${id}/status`, body);
  return response.data;
}

/** POST /admin/tournaments/:id/room — set room credentials (response carries them back). */
export async function setRoomCredentials(id: string, body: SetRoomPayload): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/admin/tournaments/${id}/room`, body);
  return response.data;
}

/** POST /admin/tournaments/:id/disqualify — disqualify a registration. */
export async function disqualifyRegistration(
  id: string,
  body: DisqualifyPayload,
): Promise<TournamentRegistration> {
  const response = await apiClient.post<TournamentRegistration>(`/admin/tournaments/${id}/disqualify`, body);
  return response.data;
}

/** POST /admin/tournaments/:id/matches — create a match. */
export async function createMatch(id: string, body: CreateMatchPayload): Promise<Match> {
  const response = await apiClient.post<Match>(`/admin/tournaments/${id}/matches`, body);
  return response.data;
}

/** POST /admin/matches/:matchId/results — bulk record results. */
export async function recordMatchResults(
  matchId: string,
  body: RecordResultsPayload,
): Promise<MatchResult[]> {
  const response = await apiClient.post<MatchResult[]>(`/admin/matches/${matchId}/results`, body);
  return response.data;
}

/** POST /admin/tournaments/:id/finalize — finalize (no body → send {}). */
export async function finalizeTournament(id: string): Promise<FinalizeResult> {
  const response = await apiClient.post<FinalizeResult>(`/admin/tournaments/${id}/finalize`, {});
  return response.data;
}
