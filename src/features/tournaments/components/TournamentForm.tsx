import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { useGames } from '@/features/games/games.hooks';
import { TEAM_MODES, TOURNAMENT_FORMATS } from '../tournaments.types';
import { formatEnum } from '../tournaments.utils';
import { tournamentFormSchema, type TournamentFormValues } from '../tournament.schema';

export interface TournamentFormProps {
  defaultValues: TournamentFormValues;
  onSubmit: (values: TournamentFormValues) => void;
  /** Disables the form while the create/update request is in flight. */
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
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
}: TournamentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
  });

  // Populate the game selector from the API, always keeping a Free Fire option
  // so the form still works if the games query is empty or fails.
  const { data: games } = useGames();
  const gameOptions =
    games && games.length > 0 ? games : [{ slug: 'free_fire', name: 'Free Fire' }];

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" placeholder="BlastIX Weekly Cup" {...register('title')} />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea
          id="description"
          placeholder="Optional summary shown to players."
          {...register('description')}
        />
      </Field>

      <Field
        label="Banner URL"
        htmlFor="banner_url"
        error={errors.banner_url?.message}
        hint="Direct link to a banner image (optional)."
      >
        <Input id="banner_url" placeholder="https://…" {...register('banner_url')} />
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
          <Input id="map" placeholder="Bermuda" {...register('map')} />
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
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { TournamentForm };
