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
import {
  tournamentFormSchema,
  PRESET_ROADMAPS,
  type TournamentFormValues,
} from '../tournament.schema';
import type { TournamentSection } from '../tournament.section';
import {
  Flame,
  Zap,
  MapPin,
  Check,
  Trophy,
  Swords,
  Shield,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

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
 * Shared create / edit form.
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
  const selectedMaps = watch('maps') || [];
  const enableRoadmap = watch('enable_roadmap') ?? true;
  const roadmapType = watch('roadmap_type') ?? '5_STAGE_STANDARD';

  // Toggle map pill
  const toggleMap = (mapName: string) => {
    const isSelected = selectedMaps.includes(mapName);
    const updated = isSelected
      ? selectedMaps.filter((m) => m !== mapName)
      : [...selectedMaps, mapName];

    setValue('maps', updated, { shouldDirty: true, shouldValidate: true });
    setValue('map', updated.join(', '), { shouldDirty: true, shouldValidate: true });
  };

  const selectAllMaps = () => {
    setValue('maps', MAP_OPTIONS, { shouldDirty: true, shouldValidate: true });
    setValue('map', MAP_OPTIONS.join(', '), { shouldDirty: true, shouldValidate: true });
  };

  const clearMaps = () => {
    setValue('maps', [], { shouldDirty: true, shouldValidate: true });
    setValue('map', '', { shouldDirty: true, shouldValidate: true });
  };

  // Populate games
  const { data: games } = useGames();
  const gameOptions =
    games && games.length > 0 ? games : [{ slug: 'free_fire', name: 'Free Fire' }];

  const currentStages = PRESET_ROADMAPS[roadmapType] || PRESET_ROADMAPS['5_STAGE_STANDARD'];

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <div className="text-xs font-bold text-foreground">⚡ BLASTiX E-Sports Tournament</div>
                  <div className="text-[11px] text-foreground-muted">
                    This tournament will appear only in the BLASTiX E-Sports section of the mobile app.
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
                <div className="text-xs font-bold">⚡ BLASTiX E-Sports</div>
                <div className="text-[10px] text-foreground-muted">BLASTiX App Section</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
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

      {/* Format & Mode */}
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
      </div>

      {/* Multi-Map Selection (Optional + Multiple Selection) */}
      <div className="rounded-xl border border-white/10 bg-surface/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-soft">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Tournament Map(s) (Optional)</span>
            </label>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Select one or multiple maps for this tournament, or leave unselected for All Maps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllMaps}
              className="text-[11px] font-semibold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearMaps}
              className="text-[11px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Map Selection Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {MAP_OPTIONS.map((mapName) => {
            const isSelected = selectedMaps.includes(mapName);
            return (
              <button
                key={mapName}
                type="button"
                onClick={() => toggleMap(mapName)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-primary text-black shadow-glow border border-primary font-semibold'
                    : 'bg-surface-2/80 text-foreground-muted hover:text-white hover:bg-surface-2 border border-white/10'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                <span>{mapName}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Maps Indicator */}
        <div className="text-[11px] text-foreground-muted pt-1">
          Selected:{' '}
          <span className="font-semibold text-foreground">
            {selectedMaps.length > 0 ? selectedMaps.join(', ') : 'All Maps (Default)'}
          </span>
        </div>
      </div>

      {/* Slots & Fees */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Max slots" htmlFor="max_slots" required error={errors.max_slots?.message}>
          <Input id="max_slots" type="number" min={1} {...register('max_slots', { valueAsNumber: true })} />
        </Field>

        <Field
          label="Entry fee (₹)"
          htmlFor="entry_fee"
          error={errors.entry_fee?.message}
          hint="0 for a free tournament."
        >
          <Input id="entry_fee" type="number" min={0} {...register('entry_fee', { valueAsNumber: true })} />
        </Field>

        <Field label="Total Prize pool (₹)" htmlFor="prize_pool" error={errors.prize_pool?.message}>
          <Input id="prize_pool" type="number" min={0} {...register('prize_pool', { valueAsNumber: true })} />
        </Field>
      </div>

      {/* Prize Distribution (Only Non-Zero Values Sent to Backend) */}
      <div className="rounded-xl border border-white/10 bg-surface/30 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-soft">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Prize distribution (₹)</span>
            </p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Only fields with values &gt; 0 will be sent to the backend. Empty or 0 fields are automatically excluded.
            </p>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setValue('first_place_prize', 500, { shouldDirty: true });
                setValue('second_place_prize', 300, { shouldDirty: true });
                setValue('third_place_prize', 200, { shouldDirty: true });
                setValue('booyah_bonus', 0, { shouldDirty: true });
                setValue('per_kill_reward', 0, { shouldDirty: true });
              }}
              className="text-[11px] px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300"
            >
              Top 3 Preset
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('first_place_prize', 0, { shouldDirty: true });
                setValue('second_place_prize', 0, { shouldDirty: true });
                setValue('third_place_prize', 0, { shouldDirty: true });
                setValue('booyah_bonus', 0, { shouldDirty: true });
                setValue('per_kill_reward', 0, { shouldDirty: true });
              }}
              className="text-[11px] px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="1st place prize (₹)" htmlFor="first_place_prize" error={errors.first_place_prize?.message}>
            <Input id="first_place_prize" type="number" min={0} {...register('first_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="2nd place prize (₹)" htmlFor="second_place_prize" error={errors.second_place_prize?.message}>
            <Input id="second_place_prize" type="number" min={0} {...register('second_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="3rd place prize (₹)" htmlFor="third_place_prize" error={errors.third_place_prize?.message}>
            <Input id="third_place_prize" type="number" min={0} {...register('third_place_prize', { valueAsNumber: true })} />
          </Field>
          <Field label="Booyah bonus (₹)" htmlFor="booyah_bonus" error={errors.booyah_bonus?.message}>
            <Input id="booyah_bonus" type="number" min={0} {...register('booyah_bonus', { valueAsNumber: true })} />
          </Field>
          <Field label="Per kill reward (₹)" htmlFor="per_kill_reward" error={errors.per_kill_reward?.message}>
            <Input id="per_kill_reward" type="number" min={0} {...register('per_kill_reward', { valueAsNumber: true })} />
          </Field>
        </div>
      </div>

      {/* Stages & Bracket Roadmap Section */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                🏆 Tournament Stages &amp; Progression Roadmap
              </h3>
              <p className="text-xs text-foreground-muted">
                Define the bracket rounds, group stages, and qualification tree seen in tournament details.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRoadmap}
              onChange={(e) => setValue('enable_roadmap', e.target.checked, { shouldDirty: true })}
              className="h-4 w-4 rounded border-white/20 bg-surface text-primary focus:ring-primary"
            />
            <span className="text-xs font-semibold text-foreground">Enable Multi-Round Roadmap</span>
          </label>
        </div>

        {enableRoadmap && (
          <div className="space-y-4 pt-2">
            {/* Preset Selector */}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setValue('roadmap_type', '5_STAGE_STANDARD', { shouldDirty: true })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  roadmapType === '5_STAGE_STANDARD'
                    ? 'border-primary bg-primary/10 shadow-glow text-white'
                    : 'border-white/10 bg-surface/50 text-foreground-muted hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>5-Stage Esports Standard</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Round 1 (8 Groups) ➔ Round 2 ➔ Wild Card ➔ Round 3 ➔ Grand Final.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue('roadmap_type', '3_STAGE_PLAYOFFS', { shouldDirty: true })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  roadmapType === '3_STAGE_PLAYOFFS'
                    ? 'border-primary bg-primary/10 shadow-glow text-white'
                    : 'border-white/10 bg-surface/50 text-foreground-muted hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Swords className="h-3.5 w-3.5" />
                  <span>3-Stage Knockouts</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Qualifiers (3 Groups) ➔ Semi-Finals ➔ Grand Final Lobby.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue('roadmap_type', 'SINGLE_STAGE_LOBBY', { shouldDirty: true })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  roadmapType === 'SINGLE_STAGE_LOBBY'
                    ? 'border-primary bg-primary/10 shadow-glow text-white'
                    : 'border-white/10 bg-surface/50 text-foreground-muted hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Single-Stage Lobby</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Direct Grand Final (12/18 Finalist Teams in 1 Match).
                </p>
              </button>
            </div>

            {/* Visual Roadmap Stepper Preview */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Visual Roadmap Flow ({currentStages.length} Stages)
                </span>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Automatic Progression
                </span>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:overflow-x-auto sm:pb-2">
                {currentStages.map((st, idx) => {
                  const isGrandFinal = st.stage_id === 'GRAND_FINAL';
                  const isWildCard = st.stage_id === 'WILDCARD';
                  return (
                    <div key={st.stage_id} className="flex items-center gap-2 shrink-0">
                      <div
                        className={`p-2.5 rounded-lg border min-w-[150px] ${
                          isGrandFinal
                            ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                            : isWildCard
                            ? 'border-purple-400/40 bg-purple-400/10 text-purple-200'
                            : 'border-primary/30 bg-primary/5 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{st.stage_name}</span>
                          {isGrandFinal ? (
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                          ) : isWildCard ? (
                            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                          ) : (
                            <Shield className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 truncate">
                          {st.description}
                        </div>
                      </div>
                      {idx < currentStages.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0 hidden sm:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule */}
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

      {/* Rules */}
      <Field
        label="Rules"
        htmlFor="rules"
        error={errors.rules?.message}
        hint="One rule per line (optional)."
      >
        <Textarea id="rules" rows={4} placeholder={'No teaming\nNo emulators\nJoin room on time'} {...register('rules')} />
      </Field>

      {/* Actions */}
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
