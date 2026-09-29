# BlastIX Admin Panel — Backend API Status

This document is the single source of truth for what the deployed BlastX Esports
backend actually exposes to the admin panel. It was compiled by reading the
NestJS backend source directly — **not** the player/mobile API documentation,
which describes no admin routes.

- **Base URL:** `https://blastx-esports-backend-production-4b5f.up.railway.app/v1`
- **Global prefix:** `/v1` (only `/health` is unprefixed)
- **Response envelope:** success → `{ "status": "success", "data": <payload> }`;
  error → `{ "status": "error", "message": "..." }`
- **Auth:** passwordless email OTP shared with players (no separate admin login).
  Admin access is gated on `role === 'ADMIN'` read from the login response /
  `GET /users/me` — the JWT does **not** carry the role.
- **Strict validation:** `forbidNonWhitelisted` rejects unknown body/query keys
  with 400, so no-body POSTs must send `{}` and no field outside a DTO may be sent.

> **Update (2026-09-28):** the backend now ships the full admin surface —
> **33 endpoints across 8 modules** (Users, Teams, Challenges, Proof Verification,
> Content, Settings/Config, Dashboard Stats, Games). Every module that used to be a
> blocked placeholder is now a real, wired feature screen. The tables below reflect
> what is live; nothing in the panel is mocked.

---

## ✅ CURRENTLY AVAILABLE

### Authentication & session
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/v1/auth/send-otp` | `{ email }` → sends a login code |
| POST | `/v1/auth/login` | `{ email, otp }` → user object **+ `token`** (JWT) |
| POST | `/v1/auth/verify-token` | `{ token }` → `{ valid: true }` (bootstrap) |
| GET | `/v1/users/me` | Current user incl. `role`; **admin = `role === 'ADMIN'`** |

### Admin write surface (all require an `ADMIN` JWT)
| # | Method | Path | Purpose |
| --- | --- | --- | --- |
| 1 | POST | `/v1/admin/tournaments` | Create tournament (`CreateTournamentDto`) |
| 2 | PATCH | `/v1/admin/tournaments/:id` | Edit tournament (all fields optional; no `game_slug`) |
| 3 | POST | `/v1/admin/tournaments/:id/status` | Set status (`{ status }`) — **POST, not PATCH** |
| 4 | POST | `/v1/admin/tournaments/:id/room` | Set room creds (`{ room_id, room_password, release_now? }`) |
| 5 | POST | `/v1/admin/tournaments/:id/disqualify` | DQ a registration (`{ registration_id, reason }`) |
| 6 | POST | `/v1/admin/tournaments/:id/matches` | Create match (`{ match_number, map, scheduled_at }`) |
| 7 | POST | `/v1/admin/matches/:matchId/results` | Bulk record results (`{ results: [{ registration_id, placement, kills }] }`) |
| 8 | POST | `/v1/admin/tournaments/:id/finalize` | Finalize (no body → send `{}`) → `{ tournament_id, final_standings[] }` |

**Tournament status enum:** `DRAFT | UPCOMING | REGISTRATION_OPEN |
REGISTRATION_CLOSED | LIVE | COMPLETED | CANCELLED`. There is **no DELETE** —
"cancelling" a tournament is `status → CANCELLED` (endpoint #3).

### Public / player reads reused by admin views
| Method | Path | Used for |
| --- | --- | --- |
| GET | `/v1/tournaments` | List (paginated: `page, limit, status, format, date_from, date_to` → `data.items[] + page, limit, total`) |
| GET | `/v1/tournaments/:id` | Tournament detail |
| GET | `/v1/tournaments/:id/participants` | Participants / registrations table |
| GET | `/v1/tournaments/:id/matches` | Matches panel |
| GET | `/v1/tournaments/:id/leaderboard` | Standings (computed from results) |
| GET | `/v1/config/init` | App config (read-only display) |

### Admin modules (the 8 newly-shipped modules — all require an `ADMIN` JWT)
| Module | Endpoints | Panel screen |
| --- | --- | --- |
| **Users** | `GET /v1/admin/users` (page, limit, search, role, is_active), `GET /v1/admin/users/:id`, `PATCH /v1/admin/users/:id` (`{ is_active?, role? }`; `PLAYER` ↔ DB `USER`) | `/users`, `/users/:id` |
| **Teams** | `GET /v1/admin/teams` (page, limit, search, game_slug), `GET /v1/admin/teams/:id` (roster) | `/teams`, `/teams/:id` (read-only) |
| **Challenges** | `GET /v1/admin/challenges` (page, limit, type, is_active), `POST`, `PATCH /:id`, `DELETE /:id` | `/challenges` |
| **Proof Verification** | `GET /v1/admin/proofs` (page, limit, status; default `PROOF_SUBMITTED`), `POST /:id/approve` (`{}`), `POST /:id/reject` (`{ reason }`) | `/proofs` |
| **Content** | `GET/POST/PATCH/DELETE /v1/admin/{banners,announcements,notices}` | `/content` (tabbed) |
| **Settings / Config** | `GET /v1/config/init` (read), `PATCH /v1/admin/config` (all optional) | `/settings` |
| **Dashboard Stats** | `GET /v1/admin/stats` → `{ users, tournaments, teams, registrations, proofs, challenges }` | `/dashboard` KPIs |
| **Games** | `GET /v1/games` → `{ slug, name }[]` | tournament create-form game selector |

**Enums added:** `UserRole = PLAYER | ADMIN`; `ChallengeType = DAILY | WEEKLY |
SPECIAL`; `ProofStatus = ACTIVE | PROOF_SUBMITTED | PROOF_REJECTED | COMPLETED |
CLAIMED`; `NoticeSeverity = INFO | WARNING | CRITICAL`.

---

## ⚠️ AVAILABLE BUT LIMITED

- **Dashboard / analytics** — the KPI cards are now backed by
  `GET /v1/admin/stats` (users, tournaments, teams, registrations, proofs,
  challenges). The live/upcoming tournament sections are still derived from
  `GET /tournaments`.
- **Room credentials read** — `GET /v1/tournaments/:id/room` requires a
  **CONFIRMED registration**, so an admin receives 403. The panel therefore
  treats the room dialog as **write-only** (endpoint #4) and issues no room GET.
- **Teams / roster** — the admin panel now reads teams via
  `GET /v1/admin/teams` (+ `/:id` roster). This is **read-only**: the only
  team-level write is per-registration disqualify (#5); there is no team CRUD.
- **Brackets / roadmap** — `GET /:id/bracket` and `/:id/roadmap` are read-only,
  derived views. There is no bracket-authoring endpoint.
- **Leaderboards** — read-only via `/:id/leaderboard`. Standings change only as a
  side effect of recording results (#7) and finalize (#8); there is no direct
  points-editing endpoint.
- **Tournament creation** — the create form now offers a game selector populated
  from `GET /v1/games`, defaulting to `free_fire` (and degrading to a single
  `free_fire` option if that list is empty/unavailable). `game_slug` must still
  match a seeded `Game` row, or `POST /admin/tournaments` returns 400.

---

## ✅ FORMERLY BLOCKED — NOW INTEGRATED

These modules used to render "Backend endpoint not currently available"
placeholders. As of 2026-09-28 the backend ships their endpoints and each is now a
real feature screen wired to the live API (see the *Admin modules* table above).

| Module | Now backed by |
| --- | --- |
| **User Management** | `GET /v1/admin/users`, `GET /:id`, `PATCH /:id` (ban / role) |
| **Teams** | `GET /v1/admin/teams`, `GET /:id` (roster) — read-only |
| **Challenges** | `GET/POST/PATCH/DELETE /v1/admin/challenges` |
| **Proof Verification** | `GET /v1/admin/proofs`, `POST /:id/approve`, `POST /:id/reject` |
| **Content** (Banners / Announcements / Notices) | `GET/POST/PATCH/DELETE /v1/admin/{banners,announcements,notices}` |
| **Settings / System Config** | `PATCH /v1/admin/config` (read via `GET /v1/config/init`) |
| **Dashboard** | `GET /v1/admin/stats` |
| **Games** | `GET /v1/games` |

---

## 🛣️ FUTURE ROADMAP (remaining backend work)

The 8 modules above are shipped. What's left is optional polish, not blocked
screens:

- **Teams write** — team CRUD (edit/disband, roster moderation). Today teams are
  read-only in the panel.
- **Proof review migration** — an explicit `PROOF_REJECTED` status + rejection
  reason / reviewer fields on `UserChallenge` make reject-with-reason first-class
  (the panel already sends `{ reason }`).
- **Config read parity** — an `ADMIN` `GET /v1/admin/config` so the settings form
  reads from the same surface it writes to (it currently reads `GET /config/init`).
- **Multi-game** — seed additional `Game` rows; the create-form selector already
  lists whatever `GET /v1/games` returns.

---

## Known runtime issues (environment, not contract)

- **`GET /v1/tournaments` was observed returning HTTP 500** on the deployed
  backend (a server/DB runtime issue — the route itself exists). The list,
  dashboard, and browser screens degrade gracefully to their error states.
  **Re-verify** once the backend is healthy; if the other new modules load but
  this one 500s, it is an environment issue, not a contract gap.
- **OTP email delivery** to `admin@blastixesports.com` depends on backend SMTP;
  if email is unreliable in an environment it blocks all admin access.
