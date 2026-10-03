import type { Paginated } from '@/types/api';

/**
 * Tournament domain types — authored from the VERIFIED deployed backend
 * (NestJS response mappers + DTOs), not the mobile API doc. Where the backend
 * response differs from any spec, the backend wins. All timestamps arrive as
 * ISO strings over JSON (the backend types them as `Date`).
 */

/* ------------------------------------------------------------------ enums */
// Kept as const arrays + unions so we can both type-check and render option lists.

export const TOURNAMENT_STATUSES = [
  'DRAFT',
  'UPCOMING',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'LIVE',
  'COMPLETED',
  'CANCELLED',
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TOURNAMENT_FORMATS = ['BATTLE_ROYALE', 'CLASH_SQUAD'] as const;
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

export const TEAM_MODES = ['SOLO', 'DUO', 'SQUAD'] as const;
export type TeamMode = (typeof TEAM_MODES)[number];

/** Backend enum values used to route events to the correct player catalogue. */
export type TournamentSectionApi = 'FREEFIRE_LIVE' | 'BLASTX';

export const REGISTRATION_STATUSES = ['CONFIRMED', 'CANCELLED', 'DISQUALIFIED'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const MATCH_STATUSES = ['SCHEDULED', 'LIVE', 'COMPLETED'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

/* --------------------------------------------------------------- responses */

/**
 * Shape returned in the list (`GET /tournaments`). The list mapper is called
 * with NO current user and includeRoom=false, so room credentials,
 * `is_registered` and `my_registration` are ABSENT from list items.
 */
export interface TournamentListItem {
  id: string;
  game_id: string;
  game_slug?: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  format: string;
  team_mode: string;
  map: string;
  max_slots: number;
  registered_count: number;
  slots_left: number;
  entry_fee: number;
  prize_pool: number;
  prize_distribution: unknown;
  rules: unknown;
  registration_opens_at: string;
  registration_closes_at: string;
  starts_at: string;
  status: string;
  section?: TournamentSectionApi;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Detail / admin-write response. `GET /tournaments/:id` omits room fields
 * (includeRoom=false), but the admin create/edit/status/room responses include
 * them (includeRoom=true) — hence all optional here.
 */
export interface Tournament extends TournamentListItem {
  room_id?: string | null;
  room_password?: string | null;
  room_released_at?: string | null;
  is_registered?: boolean;
  my_registration?: TournamentRegistration | null;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  team_id: string | null;
  status: string;
  slot_number: number;
  final_rank: number | null;
  created_at: string;
  user?: { id: string; name: string; email: string };
  team?: { id: string; name: string; tag: string } | null;
}

export interface MatchResult {
  id: string;
  match_id: string;
  registration_id: string;
  placement: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
  participant_name?: string;
  team_tag?: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  match_number: number;
  map: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  results?: MatchResult[];
}

export interface LeaderboardEntry {
  rank: number;
  registration_id: string;
  participant_name: string;
  team_name?: string | null;
  team_tag?: string | null;
  total_points: number;
  placement_points: number;
  kill_points: number;
  total_kills: number;
  booyahs: number;
  last_match_placement: number;
}

export interface FinalizeResult {
  tournament_id: string;
  final_standings: LeaderboardEntry[];
}

export type TournamentPage = Paginated<TournamentListItem>;

/* ---------------------------------------------------------------- requests */

export interface FilterTournamentQuery {
  page?: number;
  limit?: number;
  status?: TournamentStatus;
  team_mode?: TeamMode;
  format?: TournamentFormat;
  map?: string;
  date_from?: string;
  date_to?: string;
}

/** POST /admin/tournaments — mirrors CreateTournamentDto. */
export interface CreateTournamentPayload {
  section?: TournamentSectionApi;
  game_slug?: string;
  title: string;
  description?: string;
  banner_url?: string;
  format: TournamentFormat;
  team_mode: TeamMode;
  map: string;
  max_slots: number;
  entry_fee?: number;
  prize_pool?: number;
  prize_distribution?: unknown;
  rules?: unknown;
  registration_opens_at: string;
  registration_closes_at: string;
  starts_at: string;
}

/** PATCH /admin/tournaments/:id — all optional, and NO `game_slug`. */
export type UpdateTournamentPayload = Partial<Omit<CreateTournamentPayload, 'game_slug'>>;

export interface UpdateStatusPayload {
  status: TournamentStatus;
}

export interface SetRoomPayload {
  room_id: string;
  room_password: string;
  release_now?: boolean;
}

export interface DisqualifyPayload {
  registration_id: string;
  reason: string;
}

export interface CreateMatchPayload {
  match_number: number;
  map: string;
  scheduled_at: string;
}

export interface RecordResultsPayload {
  results: { registration_id: string; placement: number; kills: number }[];
}
