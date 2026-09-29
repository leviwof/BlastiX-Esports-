/**
 * Central TanStack Query key factory. Keeping every key in one place makes
 * invalidation predictable: a tournament mutation invalidates ['tournament', id],
 * which — because TanStack matches by prefix — also refreshes that tournament's
 * participants / matches / leaderboard sub-queries in one call.
 *
 * List keys are `['<resource>', params]` and detail keys `['<resource-singular>',
 * id]`, so a mutation can invalidate an entire list surface with the bare
 * `['<resource>']` prefix regardless of the active filters.
 */
export const queryKeys = {
  /** Current authenticated admin (GET /users/me). */
  me: ['me'] as const,

  /* ---------------------------------------------------------- tournaments */
  /** Paginated tournament list (GET /tournaments), keyed by the active filters. */
  tournaments: (filters?: Record<string, unknown>) => ['tournaments', filters ?? {}] as const,
  /** A single tournament (GET /tournaments/:id). */
  tournament: (id: string) => ['tournament', id] as const,
  /** Registrations for a tournament (GET /tournaments/:id/participants). */
  tournamentParticipants: (id: string) => ['tournament', id, 'participants'] as const,
  /** Matches for a tournament (GET /tournaments/:id/matches). */
  tournamentMatches: (id: string) => ['tournament', id, 'matches'] as const,
  /** Leaderboard for a tournament (GET /tournaments/:id/leaderboard). */
  tournamentLeaderboard: (id: string) => ['tournament', id, 'leaderboard'] as const,

  /* ------------------------------------------------------ user management */
  /** Paginated user list (GET /admin/users), keyed by filters. */
  users: (params?: Record<string, unknown>) => ['users', params ?? {}] as const,
  /** A single user (GET /admin/users/:id). */
  user: (id: string) => ['user', id] as const,

  /* --------------------------------------------------------------- teams */
  /** Paginated team list (GET /admin/teams), keyed by filters. */
  teams: (params?: Record<string, unknown>) => ['teams', params ?? {}] as const,
  /** A single team + roster (GET /admin/teams/:id). */
  team: (id: string) => ['team', id] as const,

  /* ---------------------------------------------------------- challenges */
  /** Paginated challenge list (GET /admin/challenges), keyed by filters. */
  challenges: (params?: Record<string, unknown>) => ['challenges', params ?? {}] as const,

  /* ------------------------------------------------------------- proofs */
  /** Paginated proof review queue (GET /admin/proofs), keyed by filters. */
  proofs: (params?: Record<string, unknown>) => ['proofs', params ?? {}] as const,

  /* ------------------------------------------------------------ content */
  /** Paginated banner list (GET /admin/banners), keyed by filters. */
  banners: (params?: Record<string, unknown>) => ['banners', params ?? {}] as const,
  /** Paginated announcement list (GET /admin/announcements), keyed by filters. */
  announcements: (params?: Record<string, unknown>) => ['announcements', params ?? {}] as const,
  /** Paginated notice list (GET /admin/notices), keyed by filters. */
  notices: (params?: Record<string, unknown>) => ['notices', params ?? {}] as const,

  /* ------------------------------------------------------- config / misc */
  /** App configuration (GET /config/init). */
  config: ['config'] as const,
  /** Aggregate dashboard stats (GET /admin/stats). */
  stats: ['stats'] as const,
  /** Seeded games list (GET /games). */
  games: ['games'] as const,
} as const;
