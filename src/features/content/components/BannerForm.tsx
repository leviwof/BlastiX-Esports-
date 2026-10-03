import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import { bannerFormSchema, type BannerFormValues } from '../content.schema';

export interface BannerFormProps {
  defaultValues: BannerFormValues;
  onSubmit: (values: BannerFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

/** Create / edit banner form (rendered inside a Modal). Mirrors CreateBannerDto. */
function BannerForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  onCancel,
}: BannerFormProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({ resolver: zodResolver(bannerFormSchema), defaultValues });
  const imageUrl = watch('image_url');

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Title" htmlFor="banner-title" required error={errors.title?.message}>
        <Input id="banner-title" placeholder="Season 5 is live" {...register('title')} />
      </Field>

      <Field
        label="Banner image"
        htmlFor="banner-image"
        required
        error={errors.image_url?.message}
        hint="Upload an image for the app banner."
      >
        <ImageUploadField
          id="banner-image"
          value={imageUrl}
          onChange={(imageUrl) => setValue('image_url', imageUrl, { shouldDirty: true, shouldValidate: true })}
          onUploadingChange={setImageUploading}
          disabled={submitting}
        />
      </Field>

      <Field
        label="Link URL"
        htmlFor="banner-link"
        error={errors.link_url?.message}
        hint="Optional — where tapping the banner leads."
      >
        <Input id="banner-link" type="url" placeholder="https://…" {...register('link_url')} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Sort order"
          htmlFor="banner-sort"
          error={errors.sort_order?.message}
          hint="Lower shows first."
        >
          <Input
            id="banner-sort"
            type="number"
            min={0}
            {...register('sort_order', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Starts at" htmlFor="banner-starts" error={errors.starts_at?.message}>
          <Input id="banner-starts" type="datetime-local" {...register('starts_at')} />
        </Field>
        <Field label="Ends at" htmlFor="banner-ends" error={errors.ends_at?.message}>
          <Input id="banner-ends" type="datetime-local" {...register('ends_at')} />
        </Field>
      </div>

      <Switch
        id="banner-active"
        label="Active"
        hint="Shown in the app while on."
        {...register('is_active')}
      />

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

export { BannerForm };
