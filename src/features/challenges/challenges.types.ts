import type { Paginated } from '@/types/api';

/**
 * Challenge domain types — mirror the `GET/POST/PATCH/DELETE /admin/challenges`
 * contract. `type` is typed wide (like tournament status) for forward-safety;
 * the form narrows it to a known `ChallengeType`.
 */

export const CHALLENGE_TYPES = ['DAILY', 'WEEKLY', 'SPECIAL'] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  target_progress: number;
  game: string;
  type: string;
  requires_recording: boolean;
  game_package: string;
  icon_asset: string | null;
  is_active: boolean;
  created_at: string;
}

export type ChallengePage = Paginated<Challenge>;

export interface ListChallengesQuery {
  page?: number;
  limit?: number;
  type?: ChallengeType;
  is_active?: boolean;
}

/** POST /admin/challenges — optional fields fall back to backend defaults. */
export interface CreateChallengePayload {
  title: string;
  description: string;
  reward_xp: number;
  target_progress?: number;
  game?: string;
  type?: ChallengeType;
  requires_recording?: boolean;
  game_package?: string;
  icon_asset?: string;
}

/** PATCH /admin/challenges/:id — all optional, plus the `is_active` soft-delete flag. */
export interface UpdateChallengePayload extends Partial<CreateChallengePayload> {
  is_active?: boolean;
}
