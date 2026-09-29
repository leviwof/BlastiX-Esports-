import { z } from 'zod';
import {
  CHALLENGE_TYPES,
  type Challenge,
  type ChallengeType,
  type CreateChallengePayload,
  type UpdateChallengePayload,
} from './challenges.types';

/**
 * Form schema + mappers for creating / editing a challenge. Mirrors the backend
 * CreateChallengeDto so bad input is caught before the strict API. Numeric
 * inputs use `valueAsNumber`; optional string fields map to `undefined` when
 * blank so we fall back to the backend defaults rather than send empty strings.
 */
export const challengeFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep the title under 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description is too long'),
  reward_xp: z
    .number({ invalid_type_error: 'Enter the XP reward' })
    .int('XP must be a whole number')
    .min(0, 'XP cannot be negative'),
  target_progress: z
    .number({ invalid_type_error: 'Enter a target' })
    .int('Target must be a whole number')
    .min(1, 'Target must be at least 1'),
  game: z.string().trim().min(1, 'Game is required'),
  type: z.enum(CHALLENGE_TYPES),
  requires_recording: z.boolean(),
  game_package: z.string().trim().min(1, 'Game package is required'),
  icon_asset: z.string().trim(),
});

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

/** Defaults for the create form (a daily Free Fire challenge is the common case). */
export const createChallengeDefaults: ChallengeFormValues = {
  title: '',
  description: '',
  reward_xp: 100,
  target_progress: 1,
  game: 'Free Fire',
  type: 'DAILY',
  requires_recording: true,
  game_package: 'com.dts.freefireth',
  icon_asset: '',
};

/** Narrow a backend string to a known enum member, falling back to `fallback`. */
function toEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Prefill the edit form from an existing challenge. */
export function challengeToFormValues(c: Challenge): ChallengeFormValues {
  return {
    title: c.title,
    description: c.description,
    reward_xp: c.reward_xp,
    target_progress: c.target_progress ?? 1,
    game: c.game || 'Free Fire',
    type: toEnum(c.type, CHALLENGE_TYPES, 'DAILY'),
    requires_recording: c.requires_recording,
    game_package: c.game_package || 'com.dts.freefireth',
    icon_asset: c.icon_asset ?? '',
  };
}

/** Validated form values → CreateChallengePayload (blank optionals omitted). */
export function toCreatePayload(values: ChallengeFormValues): CreateChallengePayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    reward_xp: values.reward_xp,
    target_progress: values.target_progress,
    game: values.game.trim() || undefined,
    type: values.type as ChallengeType,
    requires_recording: values.requires_recording,
    game_package: values.game_package.trim() || undefined,
    icon_asset: values.icon_asset.trim() || undefined,
  };
}

/** Validated form values → UpdateChallengePayload (same content fields). */
export function toUpdatePayload(values: ChallengeFormValues): UpdateChallengePayload {
  return toCreatePayload(values);
}
