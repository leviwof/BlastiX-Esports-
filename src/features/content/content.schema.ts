import { z } from 'zod';
import { fromDateTimeLocal, toDateTimeLocal } from '@/lib/format';
import {
  NOTICE_SEVERITIES,
  type Announcement,
  type Banner,
  type CreateAnnouncementPayload,
  type CreateBannerPayload,
  type CreateNoticePayload,
  type LiveStream,
  type LiveStreamPayload,
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
  tagline: z.string().trim().max(160, 'Keep the tagline under 160 characters'),
  title: z.string().trim().max(200, 'Keep the title under 200 characters'),
  subtitle: z.string().trim().max(300, 'Keep the subtitle under 300 characters'),
  brand_badge: z.string().trim().max(120, 'Keep the badge under 120 characters'),
  button_text: z.string().trim().max(80, 'Keep the button text under 80 characters'),
  target_tab_index: z.number().int().min(0).max(4),
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
  tagline: '',
  title: '',
  subtitle: '',
  brand_badge: '',
  button_text: '',
  target_tab_index: 1,
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
  starts_at: '',
  ends_at: '',
};

export function bannerToFormValues(b: Banner): BannerFormValues {
  return {
    tagline: b.tagline ?? '',
    title: b.title ?? '',
    subtitle: b.subtitle ?? '',
    brand_badge: b.brand_badge ?? '',
    button_text: b.button_text ?? '',
    target_tab_index: b.target_tab_index ?? 1,
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
    tagline: values.tagline.trim() || undefined,
    title: values.title.trim() || undefined,
    subtitle: values.subtitle.trim() || undefined,
    brand_badge: values.brand_badge.trim() || undefined,
    button_text: values.button_text.trim() || undefined,
    target_tab_index: values.target_tab_index,
    image_url: values.image_url.trim(),
    link_url: values.link_url.trim() || undefined,
    sort_order: values.sort_order,
    is_active: values.is_active,
    starts_at: fromDateTimeLocal(values.starts_at),
    ends_at: fromDateTimeLocal(values.ends_at),
  };
}

/* ----------------------------------------------------------- live streams */

export const liveStreamFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  subtitle: z.string().trim().min(1, 'Subtitle is required').max(300),
  location: z.string().trim().min(1, 'Location is required').max(160),
  viewer_count: z.string().trim().min(1, 'Enter a viewer count').max(32),
  is_live: z.boolean(),
  is_official: z.boolean(),
  image_url: z.string().trim().url('Enter a valid thumbnail URL'),
  stream_url: z.string().trim().url('Enter a valid stream URL'),
});
export type LiveStreamFormValues = z.infer<typeof liveStreamFormSchema>;

export const createLiveStreamDefaults: LiveStreamFormValues = {
  title: '',
  subtitle: '',
  location: '',
  viewer_count: '0',
  is_live: false,
  is_official: false,
  image_url: '',
  stream_url: '',
};

export function liveStreamToFormValues(stream: LiveStream): LiveStreamFormValues {
  return {
    title: stream.title,
    subtitle: stream.subtitle,
    location: stream.location,
    viewer_count: stream.viewer_count,
    is_live: stream.is_live,
    is_official: stream.is_official,
    image_url: stream.image_url,
    stream_url: stream.stream_url,
  };
}

export function toLiveStreamPayload(values: LiveStreamFormValues): LiveStreamPayload {
  return {
    ...values,
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    location: values.location.trim(),
    viewer_count: values.viewer_count.trim(),
    image_url: values.image_url.trim(),
    stream_url: values.stream_url.trim(),
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
