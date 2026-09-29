import { z } from 'zod';
import { fromDateTimeLocal, toDateTimeLocal } from '@/lib/format';
import {
  NOTICE_SEVERITIES,
  type Announcement,
  type Banner,
  type CreateAnnouncementPayload,
  type CreateBannerPayload,
  type CreateNoticePayload,
  type Notice,
  type NoticeSeverity,
} from './content.types';

/**
 * Form schemas + mappers for the three content resources. Each mirrors its
 * backend Create DTO so bad input is caught before the strict API. Optional
 * fields map to `undefined` when blank so we fall back to backend defaults
 * rather than send empty strings. Update payloads reuse the create mappers.
 */

/** Narrow a backend string to a known enum member, falling back to `fallback`. */
function toEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/* --------------------------------------------------------------- banners */

export const bannerFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep the title under 200 characters'),
  image_url: z.string().trim().url('Enter a valid image URL'),
  link_url: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  sort_order: z
    .number({ invalid_type_error: 'Enter a number' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative'),
  is_active: z.boolean(),
  starts_at: z.string(),
  ends_at: z.string(),
});
export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export const createBannerDefaults: BannerFormValues = {
  title: '',
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
};

export function bannerToFormValues(b: Banner): BannerFormValues {
  return {
    title: b.title,
    image_url: b.image_url,
    link_url: b.link_url ?? '',
    sort_order: b.sort_order,
    is_active: b.is_active,
    starts_at: toDateTimeLocal(b.starts_at),
    ends_at: toDateTimeLocal(b.ends_at),
  };
}

export function toBannerCreatePayload(values: BannerFormValues): CreateBannerPayload {
  return {
    title: values.title.trim(),
    image_url: values.image_url.trim(),
    link_url: values.link_url.trim() || undefined,
    sort_order: values.sort_order,
    is_active: values.is_active,
    starts_at: fromDateTimeLocal(values.starts_at),
    ends_at: fromDateTimeLocal(values.ends_at),
  };
}

/* --------------------------------------------------------- announcements */

export const announcementFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep the title under 200 characters'),
  body: z.string().trim().min(1, 'Body is required').max(5000, 'Body is too long'),
  is_published: z.boolean(),
});
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export const createAnnouncementDefaults: AnnouncementFormValues = {
  title: '',
  body: '',
  is_published: true,
};

export function announcementToFormValues(a: Announcement): AnnouncementFormValues {
  return { title: a.title, body: a.body, is_published: a.is_published };
}

export function toAnnouncementCreatePayload(
  values: AnnouncementFormValues,
): CreateAnnouncementPayload {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    is_published: values.is_published,
  };
}

/* --------------------------------------------------------------- notices */

export const noticeFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep the title under 200 characters'),
  body: z.string().trim().min(1, 'Body is required').max(5000, 'Body is too long'),
  severity: z.enum(NOTICE_SEVERITIES),
  is_active: z.boolean(),
});
export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

export const createNoticeDefaults: NoticeFormValues = {
  title: '',
  body: '',
  severity: 'INFO',
  is_active: true,
};

export function noticeToFormValues(n: Notice): NoticeFormValues {
  return {
    title: n.title,
    body: n.body,
    severity: toEnum(n.severity, NOTICE_SEVERITIES, 'INFO'),
    is_active: n.is_active,
  };
}

export function toNoticeCreatePayload(values: NoticeFormValues): CreateNoticePayload {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    severity: values.severity as NoticeSeverity,
    is_active: values.is_active,
  };
}
