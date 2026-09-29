import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/Switch';
import { Field } from '@/components/shared/Field';
import { SectionCard } from '@/components/shared/SectionCard';
import { useUpdateConfig } from '../config.hooks';
import {
  configFormSchema,
  toConfigDefaults,
  toUpdatePayload,
  type ConfigFormValues,
} from '../config.schema';
import type { AppConfig } from '../config.types';

export interface ConfigFormProps {
  config: AppConfig;
}

/**
 * Settings form for the app config singleton. Owns its own mutation (config is
 * only edited here); on save it re-seeds the form from the returned config so
 * the dirty state clears. The maintenance message is disabled while maintenance
 * mode is off to make the dependency obvious.
 */
function ConfigForm({ config }: ConfigFormProps) {
  const update = useUpdateConfig();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: toConfigDefaults(config),
  });

  const maintenance = watch('is_maintenance');

  const onSubmit = handleSubmit((values) => {
    update.mutate(toUpdatePayload(values), {
      onSuccess: (updated) => reset(toConfigDefaults(updated)),
    });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      <SectionCard
        title="Maintenance"
        description="Take the app offline for players during updates."
      >
        <div className="space-y-4">
          <Switch
            id="is_maintenance"
            label="Maintenance mode"
            hint="When on, players see the maintenance screen instead of the app."
            {...register('is_maintenance')}
          />
          <Field
            label="Maintenance message"
            htmlFor="maintenance_message"
            error={errors.maintenance_message?.message}
            hint="Shown to players while maintenance mode is on."
          >
            <Textarea
              id="maintenance_message"
              rows={3}
              disabled={!maintenance}
              placeholder="We'll be back shortly…"
              {...register('maintenance_message')}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="App version gate"
        description="Control the minimum and latest client versions."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Minimum version"
            htmlFor="min_version"
            error={errors.min_version?.message}
            hint="Clients below this are forced to update."
          >
            <Input id="min_version" placeholder="1.0.0" {...register('min_version')} />
          </Field>
          <Field
            label="Latest version"
            htmlFor="latest_version"
            error={errors.latest_version?.message}
          >
            <Input id="latest_version" placeholder="1.2.0" {...register('latest_version')} />
          </Field>
          <Field
            label="Update URL"
            htmlFor="update_url"
            error={errors.update_url?.message}
            hint="Store / download link shown in the update prompt."
            className="sm:col-span-2"
          >
            <Input id="update_url" type="url" placeholder="https://…" {...register('update_url')} />
          </Field>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => reset(toConfigDefaults(config))}
          disabled={!isDirty || update.isPending}
        >
          Reset
        </Button>
        <Button type="submit" disabled={!isDirty || update.isPending}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export { ConfigForm };
