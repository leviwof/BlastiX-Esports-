import type { Paginated } from '@/types/api';

/**
 * Team domain types — from the deployed admin team endpoints
 * (`GET /admin/teams`, `GET /admin/teams/:id`). Teams are player-created, so the
 * admin panel is read-only (a roster viewer). Timestamps are ISO strings.
 */

export interface TeamCaptain {
  id: string;
  name: string;
}

/** Fields shared by the list item and the detail response. */
interface TeamBase {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  game_slug: string;
  captain: TeamCaptain;
  accepting_substitutes: boolean;
  created_at: string;
}

/** List item (`GET /admin/teams`). */
export interface TeamSummary extends TeamBase {
  member_count: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  in_game_name: string | null;
  role: string;
  joined_at: string;
}

/** Detail (`GET /admin/teams/:id`) — adds the roster. */
export interface TeamDetail extends TeamBase {
  members: TeamMember[];
}

export type TeamPage = Paginated<TeamSummary>;

export interface ListTeamsQuery {
  page?: number;
  limit?: number;
  search?: string;
  game_slug?: string;
}
