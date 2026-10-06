import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import {
  createAnnouncement,
  createBanner,
  createBrandPartner,
  createLiveStream,
  createNotice,
  deleteAnnouncement,
  deleteBanner,
  deleteBrandPartner,
  deleteLiveStream,
  deleteNotice,
  listAnnouncements,
  listBanners,
  listBrandPartners,
  listLiveStreams,
  listNotices,
  listPartnerInquiries,
  updateAnnouncement,
  updateBanner,
  updateBrandPartner,
  updateLiveStream,
  updateNotice,
  updatePartnerInquiryStatus,
} from './content.api';
import type {
  CreateAnnouncementPayload,
  CreateBannerPayload,
  CreateBrandPartnerPayload,
  CreateNoticePayload,
  ListContentQuery,
  LiveStreamPayload,
  PartnerInquiry,
  UpdateAnnouncementPayload,
  UpdateBannerPayload,
  UpdateBrandPartnerPayload,
  UpdateLiveStreamPayload,
  UpdateNoticePayload,
} from './content.types';

/**
 * Content hooks — one list query plus create / update / delete mutations per
 * resource. Every mutation invalidates its list surface (the bare key prefix)
 * and toasts on success; errors share one handler.
 */

const onMutationError = (error: unknown) => toast.error(getErrorMessage(error));

/* --------------------------------------------------------------- banners */

export function useBanners(query: ListContentQuery = {}) {
  return useQuery({
    queryKey: queryKeys.banners(query as Record<string, unknown>),
    queryFn: () => listBanners(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateBanner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ body, image }: { body: CreateBannerPayload; image: File }) =>
      createBanner(body, image),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created');
    },
    onError: onMutationError,
  });
}

export function useUpdateBanner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBannerPayload }) => updateBanner(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteBanner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted');
    },
    onError: onMutationError,
  });
}

/* ----------------------------------------------------------- live streams */

export function useLiveStreams() {
  return useQuery({
    queryKey: queryKeys.liveStreams,
    queryFn: listLiveStreams,
  });
}

export function usePartnerInquiries() {
  return useQuery({
    queryKey: queryKeys.partnerInquiries,
    queryFn: listPartnerInquiries,
  });
}

export function useUpdatePartnerInquiryStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PartnerInquiry['status'] }) =>
      updatePartnerInquiryStatus(id, status),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.partnerInquiries });
      toast.success('Inquiry status updated');
    },
    onError: onMutationError,
  });
}

/* --------------------------------------------------------- brand partners */

export function useBrandPartners() {
  return useQuery({
    queryKey: ['brand-partners'],
    queryFn: listBrandPartners,
  });
}

export function useCreateBrandPartner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ body, logo }: { body: CreateBrandPartnerPayload; logo?: File }) =>
      createBrandPartner(body, logo),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['brand-partners'] });
      toast.success('Brand partner added');
    },
    onError: onMutationError,
  });
}

export function useUpdateBrandPartner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBrandPartnerPayload }) =>
      updateBrandPartner(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['brand-partners'] });
      toast.success('Brand partner updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteBrandPartner() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBrandPartner(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['brand-partners'] });
      toast.success('Brand partner deleted');
    },
    onError: onMutationError,
  });
}

export function useCreateLiveStream() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: LiveStreamPayload) => createLiveStream(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.liveStreams });
      toast.success('Live stream created');
    },
    onError: onMutationError,
  });
}

export function useUpdateLiveStream() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLiveStreamPayload }) =>
      updateLiveStream(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.liveStreams });
      toast.success('Live stream updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteLiveStream() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLiveStream(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.liveStreams });
      toast.success('Live stream deleted');
    },
    onError: onMutationError,
  });
}

/* --------------------------------------------------------- announcements */

export function useAnnouncements(query: ListContentQuery = {}) {
  return useQuery({
    queryKey: queryKeys.announcements(query as Record<string, unknown>),
    queryFn: () => listAnnouncements(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateAnnouncement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAnnouncementPayload) => createAnnouncement(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created');
    },
    onError: onMutationError,
  });
}

export function useUpdateAnnouncement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAnnouncementPayload }) =>
      updateAnnouncement(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteAnnouncement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    },
    onError: onMutationError,
  });
}

/* --------------------------------------------------------------- notices */

export function useNotices(query: ListContentQuery = {}) {
  return useQuery({
    queryKey: queryKeys.notices(query as Record<string, unknown>),
    queryFn: () => listNotices(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateNotice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateNoticePayload) => createNotice(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice created');
    },
    onError: onMutationError,
  });
}

export function useUpdateNotice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateNoticePayload }) => updateNotice(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice updated');
    },
    onError: onMutationError,
  });
}

export function useDeleteNotice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Notice deleted');
    },
    onError: onMutationError,
  });
}
