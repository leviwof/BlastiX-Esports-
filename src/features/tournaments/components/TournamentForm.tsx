import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import { useGames } from '@/features/games/games.hooks';
import { TEAM_MODES, TOURNAMENT_FORMATS } from '../tournaments.types';
import { formatEnum } from '../tournaments.utils';
import { tournamentFormSchema, type TournamentFormValues } from '../tournament.schema';
import type { TournamentSection } from '../tournament.section';
import { Flame, Zap } from 'lucide-react';

const MAP_OPTIONS = ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];

export interface TournamentFormProps {
  defaultValues: TournamentFormValues;
  onSubmit: (values: TournamentFormValues) => void;
  /** Disables the form while the create/update request is in flight. */
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  /** Lock form to specific section (Free Fire Live or BlastX E-Sports) */
  lockSection?: TournamentSection;
}

/**
 * Shared create / edit form. Validation mirrors the backend CreateTournamentDto
 * (React Hook Form + Zod); numeric inputs use `valueAsNumber` so the schema
 * validates real numbers. Datetime fields hold local values and are converted
 * to ISO by the page's submit handler (via the schema mappers).
 */
function TournamentForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
  lockSection,
}: TournamentFormProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const effectiveDefaults: TournamentFormValues = {
    ...defaultValues,
    section: lockSection ?? defaultValues.section ?? 'freefire',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: effectiveDefaults,
  });

  const currentSection = watch('section') ?? lockSection ?? 'freefire';
  const bannerUrl = watch('banner_url') ?? '';

  // Populate the game selector from the API, always keeping a Free Fire option
  // so the form still works if the games query is empty or fails.
  const { data: games } = useGames();
  const gameOptions =
    games && games.length > 0 ? games : [{ slug: 'free_fire', name: 'Free Fire' }];

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tournament Section Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground-soft">
          Tournament Category & Section
        </label>
        {lockSection ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface/50 p-3">
            {lockSection === 'freefire' ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">🔥 Free Fire Live Tournament</div>
                  <div className="text-[11px] text-foreground-muted">
                    This tournament will appear only in the Free Fire Live section of the mobile app.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">⚡ BlastX E-Sports Tournament</div>
                  <div className="text-[11px] text-foreground-muted">
                    This tournament will appear only in the BlastX E-Sports section of the mobile app.
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('section', 'freefire')}
              className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all ${
                currentSection === 'freefire'
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-sm text-foreground'
                  : 'border-white/10 bg-surface/40 text-foreground-muted hover:bg-surface/80'
              }`}
            >
              <Flame className={`h-4 w-4 ${currentSection === 'freefire' ? 'text-amber-400' : 'text-foreground-muted'}`} />
              <div>
                <div className="text-xs font-bold">🔥 Free Fire Live</div>
                <div className="text-[10px] text-foreground-muted">Free Fire App Section</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue('section', 'blastx')}
              className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all ${
                currentSection === 'blastx'
                  ? 'border-primary/50 bg-primary/10 shadow-glow text-foreground'
                  : 'border-white/10 bg-surface/40 text-foreground-muted hover:bg-surface/80'
              }`}
            >
              <Zap className={`h-4 w-4 ${currentSection === 'blastx' ? 'text-primary' : 'text-foreground-muted'}`} />
              <div>
                <div className="text-xs font-bold">⚡ BlastX E-Sports</div>
                <div className="text-[10px] text-foreground-muted">BlastX App Section</div>
              </div>
            </button>
          </div>
        )}
      </div>

      <Field label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" placeholder="Tournament Title" {...register('title')} />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea
          id="description"
          placeholder="Optional summary shown to players."
          {...register('description')}
        />
      </Field>

      <Field
        label="Tournament image"
        htmlFor="banner_url"
        error={errors.banner_url?.message}
        hint="Upload an optional image to show on the tournament card."
      >
        <ImageUploadField
          id="banner_url"
          value={bannerUrl}
          onChange={(imageUrl) => setValue('banner_url', imageUrl, { shouldDirty: true, shouldValidate: true })}
          onUploadingChange={setImageUploading}
          disabled={submitting}
        />
      </Field>

      <Field label="Game" htmlFor="game_slug" required error={errors.game_slug?.message}>
        <Select id="game_slug" {...register('game_slug')}>
          {gameOptions.map((game) => (
            <option key={game.slug} value={game.slug}>
              {game.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Format" htmlFor="format" required error={errors.format?.message}>
          <Select id="format" {...register('format')}>
            {TOURNAMENT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {formatEnum(f)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Team mode" htmlFor="team_mode" required error={errors.team_mode?.message}>
          <Select id="team_mode" {...register('team_mode')}>
            {TEAM_MODES.map((m) => (
              <option key={m} value={m}>
                {formatEnum(m)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Map" htmlFor="map" required error={errors.map?.message}>
          <Select id="map" {...register('map')}>
            <option value="">Select a map</option>
            {MAP_OPTIONS.map((map) => (
              <option key={map} value={map}>{map}</option>
            ))}
          </Select>
        </Field>

        <Field label="Max slots" htmlFor="max_slots" required error={errors.max_slots?.message}>
          <Input id="max_slots" type="number" min={1} {...register('max_slots', { valueAsNumber: true })} />
        </Field>

        <Field
          label="Entry fee"
          htmlFor="entry_fee"
          error={errors.entry_fee?.message}
          hint="0 for a free tournament."
        >
          <Input id="entry_fee" type="number" min={0} {...register('entry_fee', { valueAsNumber: true })} />
        </Field>

        <Field label="Prize pool" htmlFor="prize_pool" error={errors.prize_pool?.message}>
          <Input id="prize_pool" type="number" min={0} {...register('prize_pool', { valueAsNumber: true })} />
        </Field>
      </div>

      <div className="rounded-lg border border-border bg-surface/30 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-soft">
          Prize distribution (₹)
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="1st place" htmlFor="first_place_prize" error={errors.first_place_prize?.message}>
            <Input id="first_place_prize" type="number" min={0} {...register('first_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="2nd place" htmlFor="second_place_prize" error={errors.second_place_prize?.message}>
            <Input id="second_place_prize" type="number" min={0} {...register('second_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="3rd place" htmlFor="third_place_prize" error={errors.third_place_prize?.message}>
            <Input id="third_place_prize" type="number" min={0} {...register('third_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="Booyah bonus" htmlFor="booyah_bonus" error={errors.booyah_bonus?.message}>
            <Input id="booyah_bonus" type="number" min={0} {...register('booyah_bonus', { valueAsNumber: true })} />
          </Field>
          <Field label="Per kill reward" htmlFor="per_kill_reward" error={errors.per_kill_reward?.message}>
            <Input id="per_kill_reward" type="number" min={0} {...register('per_kill_reward', { valueAsNumber: true })} />
          </Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Registration opens"
          htmlFor="registration_opens_at"
          required
          error={errors.registration_opens_at?.message}
        >
          <Input id="registration_opens_at" type="datetime-local" {...register('registration_opens_at')} />
        </Field>

        <Field
          label="Registration closes"
          htmlFor="registration_closes_at"
          required
          error={errors.registration_closes_at?.message}
        >
          <Input id="registration_closes_at" type="datetime-local" {...register('registration_closes_at')} />
        </Field>

        <Field label="Starts at" htmlFor="starts_at" required error={errors.starts_at?.message}>
          <Input id="starts_at" type="datetime-local" {...register('starts_at')} />
        </Field>
      </div>

      <Field
        label="Rules"
        htmlFor="rules"
        error={errors.rules?.message}
        hint="One rule per line (optional)."
      >
        <Textarea id="rules" rows={4} placeholder={'No teaming\nNo emulators'} {...register('rules')} />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting || imageUploading}>
          {imageUploading ? 'Uploading image…' : submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { TournamentForm };
