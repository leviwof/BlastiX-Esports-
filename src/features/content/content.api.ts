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
  LiveStream,
  LiveStreamPayload,
  Notice,
  NoticePage,
  PartnerInquiry,
  UpdateLiveStreamPayload,
  UpdateAnnouncementPayload,
  UpdateBannerPayload,
  UpdateNoticePayload,
} from './content.types';

/**
 * Content API — CRUD over home content, announcements, and notices. The
 * response interceptor unwraps `{ status, data }`, so
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
export interface CreatedBanner {
  id: string;
  image_url: string;
}

export async function createBanner(body: CreateBannerPayload, image: File): Promise<CreatedBanner> {
  const formData = new FormData();
  formData.append('image', image);
  for (const [key, value] of Object.entries(body)) {
    if (key === 'image_url' || value === undefined) continue;
    const fieldName = key === 'sort_order' ? 'order' : key;
    formData.append(fieldName, String(value));
  }
  const response = await apiClient.post<CreatedBanner>('/admin/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
}
export async function updateBanner(id: string, body: UpdateBannerPayload): Promise<Banner> {
  const response = await apiClient.patch<Banner>(`/admin/banners/${id}`, body);
  return response.data;
}
export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/admin/banners/${id}`);
}

/* ----------------------------------------------------------- live streams */

export async function listLiveStreams(): Promise<LiveStream[]> {
  const response = await apiClient.get<LiveStream[]>('/admin/live-streams');
  return response.data;
}
export async function createLiveStream(body: LiveStreamPayload): Promise<LiveStream> {
  const response = await apiClient.post<LiveStream>('/admin/live-streams', body);
  return response.data;
}
export async function updateLiveStream(
  id: string,
  body: UpdateLiveStreamPayload,
): Promise<LiveStream> {
  const response = await apiClient.patch<LiveStream>(`/admin/live-streams/${id}`, body);
  return response.data;
}
export async function deleteLiveStream(id: string): Promise<void> {
  await apiClient.delete(`/admin/live-streams/${id}`);
}

/* ------------------------------------------------------- partner inquiries */

export async function listPartnerInquiries(): Promise<PartnerInquiry[]> {
  const response = await apiClient.get<PartnerInquiry[]>('/admin/partners/inquiries');
  return response.data;
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
