import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { formatEnum } from '@/lib/format';
import { CHALLENGE_TYPES } from '../challenges.types';
import { challengeFormSchema, type ChallengeFormValues } from '../challenges.schema';

export interface ChallengeFormProps {
  defaultValues: ChallengeFormValues;
  onSubmit: (values: ChallengeFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

/**
 * Shared create / edit challenge form (rendered inside a Modal). Validation
 * mirrors the backend CreateChallengeDto; numeric inputs use `valueAsNumber`.
 */
function ChallengeForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
}: ChallengeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues,
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" placeholder="Win a match" {...register('title')} />
      </Field>

      <Field label="Description" htmlFor="description" required error={errors.description?.message}>
        <Textarea
          id="description"
          rows={3}
          placeholder="What the player has to do."
          {...register('description')}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Reward XP" htmlFor="reward_xp" required error={errors.reward_xp?.message}>
          <Input id="reward_xp" type="number" min={0} {...register('reward_xp', { valueAsNumber: true })} />
        </Field>

        <Field
          label="Target progress"
          htmlFor="target_progress"
          required
          error={errors.target_progress?.message}
          hint="Times the action must be completed."
        >
          <Input
            id="target_progress"
            type="number"
            min={1}
            {...register('target_progress', { valueAsNumber: true })}
          />
        </Field>

        <Field label="Type" htmlFor="type" required error={errors.type?.message}>
          <Select id="type" {...register('type')}>
            {CHALLENGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatEnum(t)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Game" htmlFor="game" required error={errors.game?.message}>
          <Input id="game" placeholder="Free Fire" {...register('game')} />
        </Field>

        <Field
          label="Game package"
          htmlFor="game_package"
          required
          error={errors.game_package?.message}
          hint="Android package used to verify the app."
          className="sm:col-span-2"
        >
          <Input id="game_package" placeholder="com.dts.freefireth" {...register('game_package')} />
        </Field>

        <Field
          label="Icon asset"
          htmlFor="icon_asset"
          error={errors.icon_asset?.message}
          hint="Optional asset key for the challenge icon."
          className="sm:col-span-2"
        >
          <Input id="icon_asset" placeholder="Optional" {...register('icon_asset')} />
        </Field>
      </div>

      <Switch
        id="requires_recording"
        label="Requires screen recording"
        hint="Players must attach a recording as proof."
        {...register('requires_recording')}
      />

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

export { ChallengeForm };
