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

export interface RoadmapStageItem {
  stage_id: string;
  stage_name: string;
  stage_number: number;
  description: string;
  teams_count: number;
  groups_count: number;
  qualifying_count: number;
}

export const PRESET_ROADMAPS: Record<string, RoadmapStageItem[]> = {
  '5_STAGE_STANDARD': [
    {
      stage_id: 'ROUND_1',
      stage_name: 'Round 1 (Group Stage)',
      stage_number: 1,
      description: '96 Teams · 8 Groups · Top 6 advance per group',
      teams_count: 96,
      groups_count: 8,
      qualifying_count: 48,
    },
    {
      stage_id: 'ROUND_2',
      stage_name: 'Round 2 (Quarter Finals)',
      stage_number: 2,
      description: '48 Teams · 4 Groups · Top 6 advance + 8 to Wild Card',
      teams_count: 48,
      groups_count: 4,
      qualifying_count: 24,
    },
    {
      stage_id: 'WILDCARD',
      stage_name: 'Wild Card Stage',
      stage_number: 3,
      description: '8 Teams · Second Chance Lobby · Top 4 advance',
      teams_count: 8,
      groups_count: 1,
      qualifying_count: 4,
    },
    {
      stage_id: 'ROUND_3',
      stage_name: 'Round 3 (Semi Finals)',
      stage_number: 4,
      description: '36 Teams · 3 Groups · Top 6 advance to Grand Final',
      teams_count: 36,
      groups_count: 3,
      qualifying_count: 18,
    },
    {
      stage_id: 'GRAND_FINAL',
      stage_name: 'Grand Final',
      stage_number: 5,
      description: '18 Finalists · 1 Grand Final Lobby · Championship Decider',
      teams_count: 18,
      groups_count: 1,
      qualifying_count: 1,
    },
  ],
  '3_STAGE_PLAYOFFS': [
    {
      stage_id: 'QUALIFIERS',
      stage_name: 'Qualifiers',
      stage_number: 1,
      description: '36 Teams · 3 Groups · Top 6 advance',
      teams_count: 36,
      groups_count: 3,
      qualifying_count: 18,
    },
    {
      stage_id: 'SEMI_FINALS',
      stage_name: 'Semi Finals',
      stage_number: 2,
      description: '18 Teams · 2 Groups · Top 6 advance',
      teams_count: 18,
      groups_count: 2,
      qualifying_count: 12,
    },
    {
      stage_id: 'GRAND_FINAL',
      stage_name: 'Grand Final',
      stage_number: 3,
      description: '12 Finalists · 1 Lobby · Championship Decider',
      teams_count: 12,
      groups_count: 1,
      qualifying_count: 1,
    },
  ],
  'SINGLE_STAGE_LOBBY': [
    {
      stage_id: 'GRAND_FINAL',
      stage_name: 'Direct Grand Final',
      stage_number: 1,
      description: '12 Teams · 1 Lobby',
      teams_count: 12,
      groups_count: 1,
      qualifying_count: 1,
    },
  ],
};

/**
 * Form schema + mappers for creating / editing a tournament.
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
    map: z.string().trim().optional(),
    maps: z.array(z.string()).optional(),
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
    first_place_prize: z.number().int().min(0, 'Prize cannot be negative').optional(),
    second_place_prize: z.number().int().min(0, 'Prize cannot be negative').optional(),
    third_place_prize: z.number().int().min(0, 'Prize cannot be negative').optional(),
    booyah_bonus: z.number().int().min(0, 'Bonus cannot be negative').optional(),
    per_kill_reward: z.number().int().min(0, 'Reward cannot be negative').optional(),
    registration_opens_at: z.string().min(1, 'Registration opening time is required'),
    registration_closes_at: z.string().min(1, 'Registration closing time is required'),
    starts_at: z.string().min(1, 'Start time is required'),
    rules: z.string().optional(),
    enable_roadmap: z.boolean().optional(),
    roadmap_type: z.enum(['5_STAGE_STANDARD', '3_STAGE_PLAYOFFS', 'SINGLE_STAGE_LOBBY']).optional(),
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

/** Sensible defaults for the create form. */
export const createDefaultValues: TournamentFormValues = {
  title: '',
  description: '',
  banner_url: '',
  game_slug: 'free_fire',
  format: 'BATTLE_ROYALE',
  team_mode: 'SQUAD',
  map: '',
  maps: ['Bermuda'],
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
  enable_roadmap: true,
  roadmap_type: '5_STAGE_STANDARD',
};

/** `rules` (backend `unknown`) → newline text for the textarea. */
function rulesToText(rules: unknown): string {
  if (Array.isArray(rules)) return rules.filter((r) => typeof r === 'string').join('\n');
  if (typeof rules === 'string') return rules;
  if (rules && typeof rules === 'object' && Array.isArray((rules as any).rules)) {
    return (rules as any).rules.filter((r: unknown) => typeof r === 'string').join('\n');
  }
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
  const mapsList = t.map
    ? t.map.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const rulesObj = t.rules as any;
  const hasRoadmap = Boolean(rulesObj?.stages && Array.isArray(rulesObj.stages));

  return {
    title: cleanTournamentTitle(t.title),
    section,
    description: t.description ? t.description.replace(/\[SECTION:(FREEFIRE_LIVE|BLASTX)\]/g, '').trim() : '',
    banner_url: t.banner_url ?? '',
    game_slug: t.game_slug ?? 'free_fire',
    format: toEnum(t.format, TOURNAMENT_FORMATS, 'BATTLE_ROYALE'),
    team_mode: toEnum(t.team_mode, TEAM_MODES, 'SQUAD'),
    map: t.map || '',
    maps: mapsList.length > 0 ? mapsList : [],
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
    enable_roadmap: hasRoadmap,
    roadmap_type: '5_STAGE_STANDARD',
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

  // Requirement 1: Only send fields with positive values (> 0); do not send 0 or empty fields
  const rawPrizes: Record<string, number | undefined> = {
    first_place_prize: values.first_place_prize,
    second_place_prize: values.second_place_prize,
    third_place_prize: values.third_place_prize,
    booyah_bonus: values.booyah_bonus,
    per_kill_reward: values.per_kill_reward,
  };
  const activePrizes: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawPrizes)) {
    if (typeof v === 'number' && v > 0) {
      activePrizes[k] = v;
    }
  }
  const prize_distribution = Object.keys(activePrizes).length > 0 ? activePrizes : undefined;

  // Requirement 2: Optional map and support for multiple maps
  let finalMap = '';
  if (values.maps && values.maps.length > 0) {
    finalMap = values.maps.join(', ');
  } else if (values.map && values.map.trim()) {
    finalMap = values.map.trim();
  } else {
    finalMap = 'All Maps';
  }

  // Requirement 3: Stages & Bracket Roadmap configuration
  const stages = values.enable_roadmap
    ? PRESET_ROADMAPS[values.roadmap_type || '5_STAGE_STANDARD'] || PRESET_ROADMAPS['5_STAGE_STANDARD']
    : undefined;

  const textRules = textToRules(values.rules);
  const finalRules = stages && stages.length > 0
    ? {
        rules: textRules || [],
        stages,
      }
    : textRules;

  const schedulePayload = stages && stages.length > 0
    ? {
        stages_enabled: true,
        roadmap_type: values.roadmap_type,
        stages,
      }
    : undefined;

  return {
    section: section === 'freefire' ? 'FREEFIRE_LIVE' : section === 'blastx' ? 'BLASTX' : undefined,
    game_slug: values.game_slug?.trim() || 'free_fire',
    title,
    description,
    banner_url: values.banner_url?.trim() || undefined,
    format: values.format,
    team_mode: values.team_mode,
    map: finalMap,
    max_slots: values.max_slots,
    entry_fee: values.entry_fee,
    prize_pool: values.prize_pool,
    prize_distribution,
    booyah_bonus: values.booyah_bonus && values.booyah_bonus > 0 ? values.booyah_bonus : undefined,
    per_kill_reward: values.per_kill_reward && values.per_kill_reward > 0 ? values.per_kill_reward : undefined,
    rules: finalRules,
    schedule: schedulePayload,
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
