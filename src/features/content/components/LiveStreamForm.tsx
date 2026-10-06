import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import { liveStreamFormSchema, type LiveStreamFormValues } from '../content.schema';

interface LiveStreamFormProps {
  defaultValues: LiveStreamFormValues;
  onSubmit: (values: LiveStreamFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

function LiveStreamForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
}: LiveStreamFormProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LiveStreamFormValues>({
    resolver: zodResolver(liveStreamFormSchema),
    defaultValues,
  });
  const imageUrl = watch('image_url');

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="stream-title" required error={errors.title?.message}>
        <Input id="stream-title" placeholder="PRO SERIES 2026" {...register('title')} />
      </Field>

      <Field label="Subtitle" htmlFor="stream-subtitle" required error={errors.subtitle?.message}>
        <Input id="stream-subtitle" placeholder="Grand Finals — Day 2" {...register('subtitle')} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location" htmlFor="stream-location" required error={errors.location?.message}>
          <Input id="stream-location" placeholder="New Delhi, India" {...register('location')} />
        </Field>
        <Field
          label="Viewer count"
          htmlFor="stream-viewer-count"
          required
          error={errors.viewer_count?.message}
          hint="Display text maintained by admins; not fetched from YouTube."
        >
          <Input id="stream-viewer-count" placeholder="12.4K" {...register('viewer_count')} />
        </Field>
      </div>

      <Field
        label="Thumbnail"
        htmlFor="stream-image"
        required
        error={errors.image_url?.message}
        hint="Upload the stream card image."
      >
        <ImageUploadField
          id="stream-image"
          value={imageUrl}
          onChange={(url) => setValue('image_url', url, { shouldDirty: true, shouldValidate: true })}
          onUploadingChange={setImageUploading}
          disabled={submitting}
        />
      </Field>

      <Field label="Stream URL" htmlFor="stream-url" required error={errors.stream_url?.message}>
        <Input id="stream-url" type="url" placeholder="https://youtube.com/live/…" {...register('stream_url')} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Switch id="stream-live" label="Live now" hint="Show this card as live." {...register('is_live')} />
        <Switch
          id="stream-official"
          label="Official stream"
          hint="Mark this as an official BlastX stream."
          {...register('is_official')}
        />
      </div>

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

export { LiveStreamForm };
