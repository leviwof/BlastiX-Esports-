import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/shared/Field';
import { Switch } from '@/components/ui/Switch';
import { bannerFormSchema, type BannerFormValues } from '../content.schema';

export interface BannerFormProps {
  defaultValues: BannerFormValues;
  onSubmit: (values: BannerFormValues, image?: File) => void;
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
  const [image, setImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({ resolver: zodResolver(bannerFormSchema), defaultValues });
  const imageUrl = watch('image_url');

  useEffect(() => {
    if (!image) {
      setImagePreview(undefined);
      return;
    }
    if (typeof URL.createObjectURL !== 'function') {
      setImagePreview(undefined);
      return;
    }
    const preview = URL.createObjectURL(image);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [image]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImage(undefined);
      setImageError('Choose a JPEG, PNG or WebP image.');
      setValue('image_url', '', { shouldValidate: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImage(undefined);
      setImageError('Image must be 5 MB or smaller.');
      setValue('image_url', '', { shouldValidate: true });
      return;
    }
    setImageError(undefined);
    setImage(file);
    setValue('image_url', 'https://image-upload.local/banner', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit((values) => onSubmit(values, image))} className="space-y-5">
      <Field label="Tagline" htmlFor="banner-tagline" error={errors.tagline?.message}>
        <Input id="banner-tagline" placeholder="OFFICIAL TOURNAMENT SERIES" {...register('tagline')} />
      </Field>

      <Field label="Title (Optional)" htmlFor="banner-title" error={errors.title?.message}>
        <Input id="banner-title" placeholder="Season 5 is live" {...register('title')} />
      </Field>

      <Field label="Subtitle (Optional)" htmlFor="banner-subtitle" error={errors.subtitle?.message}>
        <Textarea id="banner-subtitle" rows={2} placeholder="Bigger squads. Bigger battles." {...register('subtitle')} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brand badge (Optional)" htmlFor="banner-brand-badge" error={errors.brand_badge?.message}>
          <Input id="banner-brand-badge" placeholder="BLASTIX ARENA" {...register('brand_badge')} />
        </Field>
        <Field label="Button text (Optional / Deprecated)" htmlFor="banner-button-text" error={errors.button_text?.message}>
          <Input id="banner-button-text" placeholder="REGISTER NOW" {...register('button_text')} />
        </Field>
      </div>

      <Field label="Tap destination" htmlFor="banner-target-tab" required error={errors.target_tab_index?.message}>
        <Select
          id="banner-target-tab"
          {...register('target_tab_index', {
            setValueAs: (value: string) => Number(value),
          })}
        >
          <option value={0}>Home</option>
          <option value={1}>Tournaments</option>
          <option value={2}>Live</option>
          <option value={3}>Challenges</option>
          <option value={4}>Profile</option>
        </Select>
      </Field>

      <Field
        label="Banner image"
        htmlFor="banner-image"
        required
        error={imageError || errors.image_url?.message}
        hint="JPEG, PNG or WebP, up to 5 MB."
      >
        <Input
          id="banner-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={submitting}
          onChange={handleImageChange}
        />
        {(imagePreview || imageUrl) && (
          <img
            src={imagePreview || imageUrl}
            alt="Banner image preview"
            className="max-h-44 w-full rounded-lg border border-white/10 object-contain object-left"
          />
        )}
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
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { BannerForm };
