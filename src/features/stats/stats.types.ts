/**
 * Dashboard stats — mirrors the aggregate `GET /admin/stats` response. Every
 * field is a server-side `count` / `groupBy`, so the dashboard no longer has to
 * derive KPIs client-side from the tournaments list.
 */
export interface AdminStats {
  users: { total: number; active: number; admins: number };
  tournaments: {
    total: number;
    live: number;
    upcoming: number;
    /** Count per tournament status (keys are the backend status enum). */
    by_status: Record<string, number>;
  };
  teams: { total: number };
  registrations: { total: number; confirmed: number };
  proofs: { pending: number };
  challenges: { active: number };
}
