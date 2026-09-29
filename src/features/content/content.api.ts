import { apiClient } from '@/lib/apiClient';
import type {
  Announcement,
  AnnouncementPage,
  Banner,
  BannerPage,
  CreateAnnouncementPayload,
  CreateBannerPayload,
  CreateNoticePayload,
  ListContentQuery,
  Notice,
  NoticePage,
  UpdateAnnouncementPayload,
  UpdateBannerPayload,
  UpdateNoticePayload,
} from './content.types';

/**
 * Content API — parallel CRUD over three resources (banners, announcements,
 * notices). The response interceptor unwraps `{ status, data }`, so
 * `response.data` is the payload; DELETE returns void (empty 2xx body).
 */

/** Drop undefined/empty values but KEEP `false` so `is_active=false` filters. */
function cleanParams(query: ListContentQuery): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number | boolean;
    }
  }
  return out;
}

/* --------------------------------------------------------------- banners */

export async function listBanners(query: ListContentQuery = {}): Promise<BannerPage> {
  const response = await apiClient.get<BannerPage>('/admin/banners', { params: cleanParams(query) });
  return response.data;
}
export async function createBanner(body: CreateBannerPayload): Promise<Banner> {
  const response = await apiClient.post<Banner>('/admin/banners', body);
  return response.data;
}
export async function updateBanner(id: string, body: UpdateBannerPayload): Promise<Banner> {
  const response = await apiClient.patch<Banner>(`/admin/banners/${id}`, body);
  return response.data;
}
export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/admin/banners/${id}`);
}

/* --------------------------------------------------------- announcements */

export async function listAnnouncements(query: ListContentQuery = {}): Promise<AnnouncementPage> {
  const response = await apiClient.get<AnnouncementPage>('/admin/announcements', {
    params: cleanParams(query),
  });
  return response.data;
}
export async function createAnnouncement(body: CreateAnnouncementPayload): Promise<Announcement> {
  const response = await apiClient.post<Announcement>('/admin/announcements', body);
  return response.data;
}
export async function updateAnnouncement(
  id: string,
  body: UpdateAnnouncementPayload,
): Promise<Announcement> {
  const response = await apiClient.patch<Announcement>(`/admin/announcements/${id}`, body);
  return response.data;
}
export async function deleteAnnouncement(id: string): Promise<void> {
  await apiClient.delete(`/admin/announcements/${id}`);
}

/* --------------------------------------------------------------- notices */

export async function listNotices(query: ListContentQuery = {}): Promise<NoticePage> {
  const response = await apiClient.get<NoticePage>('/admin/notices', { params: cleanParams(query) });
  return response.data;
}
export async function createNotice(body: CreateNoticePayload): Promise<Notice> {
  const response = await apiClient.post<Notice>('/admin/notices', body);
  return response.data;
}
export async function updateNotice(id: string, body: UpdateNoticePayload): Promise<Notice> {
  const response = await apiClient.patch<Notice>(`/admin/notices/${id}`, body);
  return response.data;
}
export async function deleteNotice(id: string): Promise<void> {
  await apiClient.delete(`/admin/notices/${id}`);
}
