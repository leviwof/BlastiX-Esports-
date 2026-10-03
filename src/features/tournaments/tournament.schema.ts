import { z } from 'zod';
import {
  TEAM_MODES,
  TOURNAMENT_FORMATS,
  type CreateTournamentPayload,
  type Tournament,
  type UpdateTournamentPayload,
} from './tournaments.types';
import { fromDateTimeLocal, toDateTimeLocal } from './tournaments.utils';
import {
  getTournamentSection,
  cleanTournamentTitle,
  formatSectionTitle,
  formatSectionDescription,
} from './tournament.section';

/**
 * Form schema + mappers for creating / editing a tournament. Mirrors the
 * backend CreateTournamentDto constraints so bad input is caught before we hit
 * the strict (`forbidNonWhitelisted`) API. The three date fields hold the local
 * value from <input type="datetime-local"> and are converted to ISO on submit;
 * `rules` is a newline textarea mapped to a string[]. Numbers are registered
 * with `valueAsNumber`, so the schema validates real numbers (NaN → message).
 */
export const tournamentFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Keep the title under 200 characters'),
    description: z.string().trim().max(4000, 'Description is too long').optional(),
    banner_url: z
      .string()
      .trim()
      .url('Enter a valid URL (including https://)')
      .optional()
      .or(z.literal('')),
    section: z.enum(['freefire', 'blastx']).optional(),
    game_slug: z.string().trim().min(1, 'Select a game'),
    format: z.enum(TOURNAMENT_FORMATS),
    team_mode: z.enum(TEAM_MODES),
    map: z.string().trim().min(1, 'Map is required'),
    max_slots: z
      .number({ invalid_type_error: 'Enter the number of slots' })
      .int('Slots must be a whole number')
      .min(1, 'At least 1 slot is required')
      .max(10000, 'That is an unusually large number of slots'),
    entry_fee: z
      .number({ invalid_type_error: 'Enter an entry fee (0 for free)' })
      .int('Entry fee must be a whole number')
      .min(0, 'Entry fee cannot be negative'),
    prize_pool: z
      .number({ invalid_type_error: 'Enter a prize pool (0 if none)' })
      .int('Prize pool must be a whole number')
      .min(0, 'Prize pool cannot be negative'),
    first_place_prize: z.number().int().min(0, 'Prize cannot be negative'),
    second_place_prize: z.number().int().min(0, 'Prize cannot be negative'),
    third_place_prize: z.number().int().min(0, 'Prize cannot be negative'),
    booyah_bonus: z.number().int().min(0, 'Bonus cannot be negative'),
    per_kill_reward: z.number().int().min(0, 'Reward cannot be negative'),
    registration_opens_at: z.string().min(1, 'Registration opening time is required'),
    registration_closes_at: z.string().min(1, 'Registration closing time is required'),
    starts_at: z.string().min(1, 'Start time is required'),
    rules: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const opens = new Date(values.registration_opens_at).getTime();
    const closes = new Date(values.registration_closes_at).getTime();
    const starts = new Date(values.starts_at).getTime();
    if (!Number.isNaN(opens) && !Number.isNaN(closes) && closes < opens) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['registration_closes_at'],
        message: 'Registration must close after it opens',
      });
    }
    if (!Number.isNaN(closes) && !Number.isNaN(starts) && starts < closes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['starts_at'],
        message: 'The tournament must start after registration closes',
      });
    }
  });

export type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

/** Sensible defaults for the create form (SQUAD Battle Royale is the common case). */
export const createDefaultValues: TournamentFormValues = {
  title: '',
  description: '',
  banner_url: '',
  game_slug: 'free_fire',
  format: 'BATTLE_ROYALE',
  team_mode: 'SQUAD',
  map: '',
  max_slots: 12,
  entry_fee: 0,
  prize_pool: 0,
  first_place_prize: 0,
  second_place_prize: 0,
  third_place_prize: 0,
  booyah_bonus: 0,
  per_kill_reward: 0,
  registration_opens_at: '',
  registration_closes_at: '',
  starts_at: '',
  rules: '',
};

/** `rules` (backend `unknown`) → newline text for the textarea. */
function rulesToText(rules: unknown): string {
  if (Array.isArray(rules)) return rules.filter((r) => typeof r === 'string').join('\n');
  if (typeof rules === 'string') return rules;
  return '';
}

function prizeValue(distribution: unknown, key: string): number {
  if (distribution && typeof distribution === 'object') {
    const value = (distribution as Record<string, unknown>)[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
  return 0;
}

/** Newline textarea → a trimmed string[] (or undefined when blank, so we omit the key). */
function textToRules(text?: string): string[] | undefined {
  if (!text) return undefined;
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
}

/** Narrow a backend string to a known enum member, falling back to `fallback`. */
function toEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Prefill the edit form from an existing tournament. */
export function tournamentToFormValues(t: Tournament): TournamentFormValues {
  const section = getTournamentSection(t);
  return {
    title: cleanTournamentTitle(t.title),
    section,
    description: t.description ? t.description.replace(/\[SECTION:(FREEFIRE_LIVE|BLASTX)\]/g, '').trim() : '',
    banner_url: t.banner_url ?? '',
    game_slug: t.game_slug ?? 'free_fire',
    format: toEnum(t.format, TOURNAMENT_FORMATS, 'BATTLE_ROYALE'),
    team_mode: toEnum(t.team_mode, TEAM_MODES, 'SQUAD'),
    map: t.map,
    max_slots: t.max_slots,
    entry_fee: t.entry_fee,
    prize_pool: t.prize_pool,
    first_place_prize: prizeValue(t.prize_distribution, 'first_place_prize'),
    second_place_prize: prizeValue(t.prize_distribution, 'second_place_prize'),
    third_place_prize: prizeValue(t.prize_distribution, 'third_place_prize'),
    booyah_bonus: prizeValue(t.prize_distribution, 'booyah_bonus'),
    per_kill_reward: prizeValue(t.prize_distribution, 'per_kill_reward'),
    registration_opens_at: toDateTimeLocal(t.registration_opens_at),
    registration_closes_at: toDateTimeLocal(t.registration_closes_at),
    starts_at: toDateTimeLocal(t.starts_at),
    rules: rulesToText(t.rules),
  };
}

/** Validated form values → CreateTournamentPayload (blank optionals omitted). */
export function toCreatePayload(
  values: TournamentFormValues,
  overrideSection?: 'freefire' | 'blastx',
): CreateTournamentPayload {
  const section = overrideSection ?? values.section;
  const title = section && overrideSection ? formatSectionTitle(values.title, section) : values.title.trim();
  const description = section && overrideSection
    ? formatSectionDescription(values.description, section)
    : values.description?.trim() || undefined;

  return {
    section: section === 'freefire' ? 'FREEFIRE_LIVE' : section === 'blastx' ? 'BLASTX' : undefined,
    game_slug: values.game_slug?.trim() || 'free_fire',
    title,
    description,
    banner_url: values.banner_url?.trim() || undefined,
    format: values.format,
    team_mode: values.team_mode,
    map: values.map.trim(),
    max_slots: values.max_slots,
    entry_fee: values.entry_fee,
    prize_pool: values.prize_pool,
    prize_distribution: {
      first_place_prize: values.first_place_prize,
      second_place_prize: values.second_place_prize,
      third_place_prize: values.third_place_prize,
      booyah_bonus: values.booyah_bonus,
      per_kill_reward: values.per_kill_reward,
    },
    rules: textToRules(values.rules),
    registration_opens_at: fromDateTimeLocal(values.registration_opens_at) as string,
    registration_closes_at: fromDateTimeLocal(values.registration_closes_at) as string,
    starts_at: fromDateTimeLocal(values.starts_at) as string,
  };
}

/** Validated form values → UpdateTournamentPayload (identical, minus `game_slug`). */
export function toUpdatePayload(
  values: TournamentFormValues,
  overrideSection?: 'freefire' | 'blastx',
): UpdateTournamentPayload {
  const { game_slug, ...rest } = toCreatePayload(values, overrideSection);
  return rest;
}
