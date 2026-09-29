import type { Paginated } from '@/types/api';

/**
 * Proof-verification domain types — mirror `GET /admin/proofs` and the
 * approve / reject actions. The `:id` is the UserChallenge id (a player's
 * attempt at a challenge). `status` is typed wide for forward-safety.
 */

export const PROOF_STATUSES = [
  'ACTIVE',
  'PROOF_SUBMITTED',
  'PROOF_REJECTED',
  'COMPLETED',
  'CLAIMED',
] as const;
export type ProofStatus = (typeof PROOF_STATUSES)[number];

export interface Proof {
  id: string;
  proof_url: string | null;
  status: string;
  current_progress: number;
  submitted_at: string | null;
  user: { id: string; name: string; email: string };
  challenge: { id: string; title: string; reward_xp: number };
}

export type ProofPage = Paginated<Proof>;

export interface ListProofsQuery {
  page?: number;
  limit?: number;
  /** Backend defaults to `PROOF_SUBMITTED` (the pending review queue) when omitted. */
  status?: ProofStatus;
}

/** POST /admin/proofs/:id/reject — reason shown to the player. */
export interface RejectProofPayload {
  reason: string;
}
