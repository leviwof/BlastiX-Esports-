# BlastIX — Backend Endpoints To Build (Admin Panel)

Hand this to whoever owns the NestJS backend (`Desktop\BlastX-Esports`). It lists
every endpoint the admin panel still needs, written to match the **existing**
codebase conventions so it drops in with no guesswork. Each module says whether it
needs a Prisma migration, gives the DTOs (class-validator), and shows the exact
JSON the frontend expects back.

> Good news up front: only **Content** (banners / announcements / notices) needs
> new database tables. Everything else reuses models that already exist
> (`User`, `Team`, `Challenge`, `UserChallenge`, `AppConfig`, `Game`).

---

## 1. Conventions (all endpoints follow these)

- **Prefix:** every route is under the global `/v1` prefix.
- **Guards:** admin routes use the same trio the tournament admin controller uses:
  ```ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Controller('admin/...')
  ```
- **Response envelope:** controllers just `return` the payload. The existing
  `ResponseInterceptor` wraps it into `{ "status": "success", "data": <payload> }`.
  For errors, throw a Nest `HttpException` (e.g. `NotFoundException`) — the global
  filter renders `{ "status": "error", "message": "..." }`.
- **Validation:** the global `ValidationPipe` runs with
  `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`. So:
  - Every field must be declared on a DTO or the request 400s.
  - No-body POSTs must send `{}`.
  - Query DTOs need `@Type(() => Number)` / `@Transform` to coerce strings.
- **Naming:** request bodies and responses are **snake_case** (like
  `create-tournament.dto.ts` → `game_slug`, `max_slots`). Convert Prisma camelCase
  in a small `*.mapper.ts` (see `user.mapper.ts` for the pattern). Dates serialize
  as ISO-8601 strings.
- **Role in responses:** map DB `USER → "PLAYER"`, keep `ADMIN → "ADMIN"`
  (`toUserResponse` already does this). Admin gate is `role === 'ADMIN'`.
- **Pagination (list endpoints):** query `page` (default 1), `limit`
  (default 20, max 100); response is `{ items: [...], page, limit, total }`
  — identical to `GET /v1/tournaments` so the frontend reuses one `Paginated<T>` type.

---

## 2. Endpoint summary

| # | Method | Path | Module | New model? |
| --- | --- | --- | --- | --- |
| 1 | GET | `/v1/admin/users` | User mgmt | no |
| 2 | GET | `/v1/admin/users/:id` | User mgmt | no |
| 3 | PATCH | `/v1/admin/users/:id` | User mgmt (ban / role) | no |
| 4 | GET | `/v1/admin/teams` | Teams | no |
| 5 | GET | `/v1/admin/teams/:id` | Teams (roster) | no |
| 6 | GET | `/v1/admin/challenges` | Challenges | no |
| 7 | POST | `/v1/admin/challenges` | Challenges | no |
| 8 | PATCH | `/v1/admin/challenges/:id` | Challenges | no |
| 9 | DELETE | `/v1/admin/challenges/:id` | Challenges | no |
| 10 | GET | `/v1/admin/proofs` | Proof review | no* |
| 11 | POST | `/v1/admin/proofs/:id/approve` | Proof review | no* |
| 12 | POST | `/v1/admin/proofs/:id/reject` | Proof review | no* |
| 13 | GET | `/v1/admin/banners` | Content | **yes** |
| 14 | POST | `/v1/admin/banners` | Content | **yes** |
| 15 | PATCH | `/v1/admin/banners/:id` | Content | **yes** |
| 16 | DELETE | `/v1/admin/banners/:id` | Content | **yes** |
| 17–20 | (same 4) | `/v1/admin/announcements` | Content | **yes** |
| 21–24 | (same 4) | `/v1/admin/notices` | Content | **yes** |
| 25 | PATCH | `/v1/admin/config` | Settings | no |
| 26 | GET | `/v1/admin/stats` | Dashboard | no |
| 27 | GET | `/v1/games` | Games (optional) | no |

`*` Proof review reuses the existing `UserChallenge` model; a tiny optional
migration (a `PROOF_REJECTED` status + a reason field) makes "reject with reason"
cleaner — see §3.4.

---

## 3. Modules

### 3.1 User Management  — model exists (`User`), no migration

The `User` model already has everything needed (`role`, `isActive`, `xp`, `rank`).
Just add an `admin/users` controller + service + a `toAdminUserResponse` mapper.

**Endpoints**

| Method | Path | Body / Query | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/admin/users` | query below | Paginated, searchable user list |
| GET | `/v1/admin/users/:id` | — | One user (detail) |
| PATCH | `/v1/admin/users/:id` | `UpdateUserDto` | Ban / unban, change role |

**DTOs**
```ts
// list-users.query.ts
class ListUsersQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)          page?: number;   // default 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number; // default 20
  @IsOptional() @IsString()                                    search?: string; // name OR email contains
  @IsOptional() @IsIn(['PLAYER', 'ADMIN'])                     role?: 'PLAYER' | 'ADMIN';
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() is_active?: boolean;
}

// update-user.dto.ts
class UpdateUserDto {
  @IsOptional() @IsBoolean()               is_active?: boolean;         // false = ban
  @IsOptional() @IsIn(['PLAYER', 'ADMIN']) role?: 'PLAYER' | 'ADMIN';   // map PLAYER→USER before persisting
}
```
> `search` → `where.OR = [{ name: { contains, mode: 'insensitive' } }, { email: { contains, mode: 'insensitive' } }]`.
> `role: 'PLAYER'` maps to Prisma `USER` on the way in; responses map back.

**Response contract** (`data` for the list is `Paginated<AdminUser>`)
```jsonc
// AdminUser
{
  "id": "clx...", "name": "Neo", "email": "neo@x.com", "profile_pic": null,
  "role": "PLAYER", "is_active": true, "xp": 1200, "rank": 42,
  "created_at": "2026-01-05T10:00:00.000Z", "updated_at": "2026-09-01T08:00:00.000Z"
}
```
**Unblocks:** the *User Management* screen (list + search, ban toggle, role change).

### 3.2 Teams  — models exist (`Team`, `TeamMember`), no migration

Read-only is enough to unblock the panel (teams are created by players; the only
existing admin write is per-registration disqualify). A `team.mapper.ts` already
exists — reuse/extend it.

**Endpoints**

| Method | Path | Query | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/admin/teams` | `page, limit, search, game_slug?` | Paginated team list |
| GET | `/v1/admin/teams/:id` | — | Team detail + roster |

Optional moderation (only if you want it): `DELETE /v1/admin/teams/:id`,
`DELETE /v1/admin/teams/:id/members/:memberId`. Not required for the current panel.

**Response contract**
```jsonc
// TeamSummary (list item)
{
  "id": "clt...", "name": "Team Alpha", "tag": "ALPH", "logo_url": null,
  "game_slug": "free_fire", "captain": { "id": "clu...", "name": "Trinity" },
  "member_count": 4, "accepting_substitutes": true,
  "created_at": "2026-02-10T12:00:00.000Z"
}

// TeamDetail (adds roster)
{
  "id": "clt...", "name": "Team Alpha", "tag": "ALPH", "logo_url": null,
  "game_slug": "free_fire", "accepting_substitutes": true,
  "captain": { "id": "clu...", "name": "Trinity" },
  "members": [
    { "id": "ctm...", "user_id": "clu...", "name": "Trinity",
      "in_game_name": "TRIN", "role": "CAPTAIN", "joined_at": "2026-02-10T12:00:00.000Z" }
  ],
  "created_at": "2026-02-10T12:00:00.000Z"
}
```
> `game_slug` comes from `team.game.slug`; `member_count` from `_count.members`;
> `in_game_name` from the member's `GameProfile` for that game (optional — omit if
> not easily joined).

**Unblocks:** the *Teams* screen (roster viewer). Disqualify already exists
(`POST /v1/admin/tournaments/:id/disqualify`).

### 3.3 Challenges (CRUD)  — model exists (`Challenge`), no migration

Challenges are currently seeded in code. The `Challenge` model already has all
fields; just add an admin CRUD controller. A `challenge.mapper.ts` already exists.

**Endpoints**

| Method | Path | Body | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/admin/challenges` | query `page, limit, type?, is_active?` | List |
| POST | `/v1/admin/challenges` | `CreateChallengeDto` | Create |
| PATCH | `/v1/admin/challenges/:id` | `UpdateChallengeDto` (all optional) | Edit |
| DELETE | `/v1/admin/challenges/:id` | — | Delete |

> **Delete caution:** deleting a `Challenge` cascade-deletes its `UserChallenge`
> rows (player progress). Prefer **soft delete** — `PATCH { is_active: false }` —
> and keep `DELETE` only for challenges with no progress. Say which you implement.

**DTOs**
```ts
class CreateChallengeDto {
  @IsString() @IsNotEmpty()                 title: string;
  @IsString() @IsNotEmpty()                 description: string;
  @Type(() => Number) @IsInt() @Min(0)      reward_xp: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) target_progress?: number; // default 1.0
  @IsOptional() @IsString()                 game?: string;             // default "Free Fire"
  @IsOptional() @IsEnum(ChallengeType)      type?: ChallengeType;      // DAILY|WEEKLY|SPECIAL, default DAILY
  @IsOptional() @IsBoolean()                requires_recording?: boolean; // default true
  @IsOptional() @IsString()                 game_package?: string;     // default "com.dts.freefireth"
  @IsOptional() @IsString()                 icon_asset?: string;
}
// UpdateChallengeDto: same fields, every one @IsOptional() (+ is_active?: boolean)
```

**Response contract**
```jsonc
{
  "id": "clc...", "title": "Win 3 matches", "description": "...",
  "reward_xp": 500, "target_progress": 3, "game": "Free Fire",
  "type": "DAILY", "requires_recording": true,
  "game_package": "com.dts.freefireth", "icon_asset": null,
  "is_active": true, "created_at": "2026-03-01T00:00:00.000Z"
}
```
**Unblocks:** the *Challenges* screen (create / edit / activate / delete).

### 3.4 Proof Verification  — reuse `UserChallenge` (no new model)

There is no separate `Proof` model and you don't need one. A proof **is** a
`UserChallenge` row that has a `proofUrl` and is awaiting review. The natural
"pending queue" filter is `status = PROOF_SUBMITTED` (that enum value already
exists in `ChallengeStatus`).

**Optional tiny migration (recommended)** — so "reject with a reason" is real
instead of silently reverting:
```prisma
enum ChallengeStatus {
  ACTIVE
  PROOF_SUBMITTED
  PROOF_REJECTED   // + add this
  COMPLETED
  CLAIMED
}

model UserChallenge {
  // ...existing fields...
  rejectionReason String?   @map("rejection_reason")  // + add
  reviewedAt      DateTime? @map("reviewed_at")        // + add
  reviewedBy      String?   @map("reviewed_by")        // + add (admin user id)
}
```
`npx prisma migrate dev --name proof_review`. Without it, `reject` can just set
`status → ACTIVE` and clear `proofUrl` (player resubmits) — no reason stored.

**Endpoints** — `:id` is the **`UserChallenge` id**.

| Method | Path | Body | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/admin/proofs` | query `page, limit, status?` (default `PROOF_SUBMITTED`) | Review queue |
| POST | `/v1/admin/proofs/:id/approve` | `{}` | Mark `COMPLETED` + award XP |
| POST | `/v1/admin/proofs/:id/reject` | `{ reason }` | Mark `PROOF_REJECTED` (or revert) |

```ts
class RejectProofDto { @IsString() @IsNotEmpty() @MaxLength(500) reason: string; }
```
> **Approve** should reuse whatever completion logic already awards `reward_xp`
> when a challenge completes, then set `status = COMPLETED`, `isCompleted = true`.

**Response contract** (list item)
```jsonc
{
  "id": "cuc...", "proof_url": "https://.../clip.mp4", "status": "PROOF_SUBMITTED",
  "current_progress": 3, "submitted_at": "2026-09-20T14:00:00.000Z",
  "user": { "id": "clu...", "name": "Neo", "email": "neo@x.com" },
  "challenge": { "id": "clc...", "title": "Win 3 matches", "reward_xp": 500 }
}
```
**Unblocks:** the *Proof Verification* screen (pending queue, approve/reject).

### 3.5 Content: Banners / Announcements / Notices  — NEW models + migration

This is the **only** module that needs new tables. Three small models, each with a
parallel CRUD controller. (The mobile app can later read the active ones via public
`GET /v1/{banners,announcements,notices}` — out of scope here, just leave room.)

**Prisma models** (add to `schema.prisma`, then `npx prisma migrate dev --name content`)
```prisma
enum NoticeSeverity { INFO WARNING CRITICAL }

model Banner {
  id        String   @id @default(cuid())
  title     String
  imageUrl  String   @map("image_url")
  linkUrl   String?  @map("link_url")
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  startsAt  DateTime? @map("starts_at")
  endsAt    DateTime? @map("ends_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("banners")
}

model Announcement {
  id          String   @id @default(cuid())
  title       String
  body        String
  isPublished Boolean  @default(true) @map("is_published")
  publishedAt DateTime? @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  @@map("announcements")
}

model Notice {
  id        String         @id @default(cuid())
  title     String
  body      String
  severity  NoticeSeverity @default(INFO)
  isActive  Boolean        @default(true) @map("is_active")
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")
  @@map("notices")
}
```

**Endpoints** — same 4 verbs per resource (`banners`, `announcements`, `notices`):

| Method | Path | Body |
| --- | --- | --- |
| GET | `/v1/admin/{resource}` | query `page, limit, is_active?` → `Paginated<T>` |
| POST | `/v1/admin/{resource}` | create DTO |
| PATCH | `/v1/admin/{resource}/:id` | update DTO (all optional) |
| DELETE | `/v1/admin/{resource}/:id` | — |

**DTOs**
```ts
class CreateBannerDto {
  @IsString() @IsNotEmpty()               title: string;
  @IsUrl()                                image_url: string;
  @IsOptional() @IsUrl()                  link_url?: string;
  @IsOptional() @Type(() => Number) @IsInt() sort_order?: number;   // default 0
  @IsOptional() @IsBoolean()              is_active?: boolean;       // default true
  @IsOptional() @IsDateString()           starts_at?: string;
  @IsOptional() @IsDateString()           ends_at?: string;
}
class CreateAnnouncementDto {
  @IsString() @IsNotEmpty()  title: string;
  @IsString() @IsNotEmpty()  body: string;
  @IsOptional() @IsBoolean() is_published?: boolean;                 // default true
}
class CreateNoticeDto {
  @IsString() @IsNotEmpty()                          title: string;
  @IsString() @IsNotEmpty()                          body: string;
  @IsOptional() @IsEnum(NoticeSeverity)              severity?: NoticeSeverity; // default INFO
  @IsOptional() @IsBoolean()                         is_active?: boolean;       // default true
}
// Update*Dto: same fields, all @IsOptional().
```

**Response contracts**
```jsonc
// Banner
{ "id":"clb...","title":"Season 5","image_url":"https://.../b.jpg","link_url":null,
  "sort_order":0,"is_active":true,"starts_at":null,"ends_at":null,
  "created_at":"2026-09-01T00:00:00.000Z","updated_at":"2026-09-01T00:00:00.000Z" }
// Announcement
{ "id":"cla...","title":"Maintenance Sat","body":"...","is_published":true,
  "published_at":"2026-09-01T00:00:00.000Z","created_at":"...","updated_at":"..." }
// Notice
{ "id":"cln...","title":"Fair play","body":"...","severity":"WARNING",
  "is_active":true,"created_at":"...","updated_at":"..." }
```
**Unblocks:** the *Content* screens (Banners, Announcements, Community Notices).

### 3.6 Settings / Config write  — model exists (`AppConfig`), no migration

`AppConfig` is a single row (`id = 1`) exposed read-only via `GET /v1/config/init`.
Add one admin PATCH that updates that row and returns the same shape.

**Endpoint**

| Method | Path | Body |
| --- | --- | --- |
| PATCH | `/v1/admin/config` | `UpdateConfigDto` (all optional) |

```ts
class UpdateConfigDto {
  @IsOptional() @IsBoolean() is_maintenance?: boolean;
  @IsOptional() @IsString()  maintenance_message?: string;
  @IsOptional() @IsString()  min_version?: string;
  @IsOptional() @IsString()  latest_version?: string;
  @IsOptional() @IsString()  update_url?: string;
}
```
> Update with `prisma.appConfig.update({ where: { id: 1 }, data })`.

**Response contract** (same shape `GET /config/init` returns)
```jsonc
{ "min_version":"1.2.0","latest_version":"1.4.0","is_maintenance":false,
  "maintenance_message":"","update_url":"https://play.google.com/..." }
```
**Unblocks:** the *Settings / System Config* screen (maintenance toggle + versions).

### 3.7 Dashboard stats  — no model, no migration

One aggregate endpoint of `count` queries so the dashboard stops deriving numbers
from the tournaments list.

**Endpoint:** `GET /v1/admin/stats`
```jsonc
{
  "users":         { "total": 1240, "active": 1180, "admins": 3 },
  "tournaments":   { "total": 86, "live": 2, "upcoming": 5,
                     "by_status": { "DRAFT": 4, "REGISTRATION_OPEN": 6, "COMPLETED": 60, "...": 0 } },
  "teams":         { "total": 210 },
  "registrations": { "total": 5400, "confirmed": 5100 },
  "proofs":        { "pending": 12 },
  "challenges":    { "active": 8 }
}
```
> All from `prisma.*.count(...)` + one `groupBy` on tournament `status`. Cheap.

**Unblocks:** real dashboard KPI cards (today they're derived client-side).

### 3.8 Games list (optional — only if multi-game)  — model exists (`Game`)

Only needed if tournaments should span more than Free Fire. Lets the create form
show a game selector instead of the hardcoded `game_slug: 'free_fire'`.

**Endpoint:** `GET /v1/games` (or `/v1/admin/games`) → `[{ "slug":"free_fire","name":"Free Fire" }]`

> Regardless of this endpoint: a `Game` row with `slug = "free_fire"` **must be
> seeded**, or `POST /v1/admin/tournaments` returns `400 Game 'free_fire' not found`.

---

## 4. Prisma migrations needed

| Migration | What | Required? |
| --- | --- | --- |
| `content` | `Banner`, `Announcement`, `Notice` models + `NoticeSeverity` enum | **Yes** (Content module) |
| `proof_review` | `PROOF_REJECTED` status + `rejectionReason` / `reviewedAt` / `reviewedBy` on `UserChallenge` | Optional (nicer reject) |

Everything else (Users, Teams, Challenges, Config, Stats, Games) reuses existing
models — controllers/services/DTOs only, **no schema change**.

Also seed a `Game` row `{ slug: "free_fire", name: "Free Fire" }` if not already
present — the existing tournament-create endpoint depends on it.

## 5. Suggested build order (fastest unblocks first)

1. **Dashboard stats** (`/admin/stats`) — one file, no migration, high visibility.
2. **User Management** — reuses `User`; unblocks the biggest requested module.
3. **Config write** (`/admin/config`) — trivial, one PATCH.
4. **Challenges CRUD** — reuses `Challenge`.
5. **Proof review** — reuses `UserChallenge` (+ optional `proof_review` migration).
6. **Teams (read)** — reuses `Team`/`TeamMember`.
7. **Content** — the one migration; three parallel CRUD controllers.
8. **Games list** — only if going multi-game.

Each new module = a folder like `src/<feature>/` with `*.controller.ts`,
`*.service.ts`, `dto/`, and a `*.mapper.ts` (copy `user.mapper.ts` for the
camelCase→snake_case pattern). Register the module in `AppModule`.

## 6. Already built — do NOT rebuild

These exist and the admin panel already uses them; listed so nothing here
duplicates them: `POST/PATCH /v1/admin/tournaments`,
`/v1/admin/tournaments/:id/{status,room,disqualify,matches,finalize}`,
`POST /v1/admin/matches/:matchId/results`, the auth routes
(`/v1/auth/{send-otp,login,verify-token}`, `GET /v1/users/me`), and the public
tournament reads (`GET /v1/tournaments`, `/:id`, `/:id/{participants,matches,leaderboard}`).
