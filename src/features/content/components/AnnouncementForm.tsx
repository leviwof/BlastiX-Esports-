import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { announcementFormSchema, type AnnouncementFormValues } from '../content.schema';

export interface AnnouncementFormProps {
  defaultValues: AnnouncementFormValues;
  onSubmit: (values: AnnouncementFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

/** Create / edit announcement form. Mirrors CreateAnnouncementDto. */
function AnnouncementForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues,
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="ann-title" required error={errors.title?.message}>
        <Input id="ann-title" placeholder="Scheduled maintenance" {...register('title')} />
      </Field>

      <Field label="Body" htmlFor="ann-body" required error={errors.body?.message}>
        <Textarea
          id="ann-body"
          rows={5}
          placeholder="What players need to know."
          {...register('body')}
        />
      </Field>

      <Switch
        id="ann-published"
        label="Published"
        hint="Visible to players while on."
        {...register('is_published')}
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

export { AnnouncementForm };
