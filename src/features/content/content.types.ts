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
  tagline: string | null;
  title: string;
  subtitle: string | null;
  brand_badge: string | null;
  image_url: string;
  button_text: string | null;
  target_tab_index: number;
  link_url: string | null;
  sort_order: number;
  order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerPayload {
  tagline?: string;
  title: string;
  subtitle?: string;
  brand_badge?: string;
  image_url: string;
  button_text?: string;
  target_tab_index?: number;
  link_url?: string;
  sort_order?: number;
  order?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

/* ----------------------------------------------------------- live streams */

export interface LiveStream {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  viewer_count: string;
  is_live: boolean;
  is_official: boolean;
  image_url: string;
  stream_url: string;
}

export interface LiveStreamPayload {
  title: string;
  subtitle: string;
  location: string;
  viewer_count: string;
  is_live: boolean;
  is_official: boolean;
  image_url: string;
  stream_url: string;
}

export type UpdateLiveStreamPayload = Partial<LiveStreamPayload>;

/* ------------------------------------------------------- partner inquiries */

export type PartnerInquiryStatus = 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'CLOSED';

export interface PartnerInquiry {
  id: string;
  brand_name: string;
  contact_name: string;
  email: string;
  phone: string;
  partnership_type: string;
  message: string;
  status?: PartnerInquiryStatus;
  created_at: string;
}

/* --------------------------------------------------------- brand partners */

export interface BrandPartner {
  id: string;
  name: string;
  logo_url: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateBrandPartnerPayload {
  name: string;
  logo_url?: string;
  sort_order?: number;
  order?: number;
  is_active?: boolean;
}

export type UpdateBrandPartnerPayload = Partial<CreateBrandPartnerPayload>;

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
