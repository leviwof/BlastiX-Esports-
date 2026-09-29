import type { Paginated } from '@/types/api';

/**
 * Content domain types — banners, announcements and community notices, from the
 * deployed admin content endpoints (`/admin/{banners,announcements,notices}`).
 * Timestamps are ISO strings; enum fields are typed wide (`string`) for
 * forward-safety and narrowed by the forms.
 */

/* ------------------------------------------------------------------ enums */

export const NOTICE_SEVERITIES = ['INFO', 'WARNING', 'CRITICAL'] as const;
export type NoticeSeverity = (typeof NOTICE_SEVERITIES)[number];

/* --------------------------------------------------------------- banners */

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerPayload {
  title: string;
  image_url: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

/* --------------------------------------------------------- announcements */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  is_published?: boolean;
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;

/* --------------------------------------------------------------- notices */

export interface Notice {
  id: string;
  title: string;
  body: string;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoticePayload {
  title: string;
  body: string;
  severity?: NoticeSeverity;
  is_active?: boolean;
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>;

/* ---------------------------------------------------------------- shared */

export interface ListContentQuery {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export type BannerPage = Paginated<Banner>;
export type AnnouncementPage = Paginated<Announcement>;
export type NoticePage = Paginated<Notice>;
