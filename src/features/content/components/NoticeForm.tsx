import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { formatEnum } from '@/lib/format';
import { NOTICE_SEVERITIES } from '../content.types';
import { noticeFormSchema, type NoticeFormValues } from '../content.schema';

export interface NoticeFormProps {
  defaultValues: NoticeFormValues;
  onSubmit: (values: NoticeFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

/** Create / edit community notice form. Mirrors CreateNoticeDto. */
function NoticeForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
}: NoticeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoticeFormValues>({ resolver: zodResolver(noticeFormSchema), defaultValues });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="notice-title" required error={errors.title?.message}>
        <Input id="notice-title" placeholder="Fair play reminder" {...register('title')} />
      </Field>

      <Field label="Body" htmlFor="notice-body" required error={errors.body?.message}>
        <Textarea id="notice-body" rows={5} placeholder="The notice text." {...register('body')} />
      </Field>

      <Field label="Severity" htmlFor="notice-severity" required error={errors.severity?.message}>
        <Select id="notice-severity" {...register('severity')}>
          {NOTICE_SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {formatEnum(s)}
            </option>
          ))}
        </Select>
      </Field>

      <Switch
        id="notice-active"
        label="Active"
        hint="Shown to players while on."
        {...register('is_active')}
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

export { NoticeForm };
