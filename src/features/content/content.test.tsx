import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { ContentPage } from '@/pages/ContentPage';
import type { Banner, BannerPage, LiveStream, PartnerInquiry } from '@/features/content/content.types';
import {
  createBanner,
  listBanners,
  listLiveStreams,
  listPartnerInquiries,
} from '@/features/content/content.api';

// Only the banners tab is exercised, so only its reads / writes are referenced;
// the content API module is auto-mocked and toasts are stubbed.
vi.mock('@/features/content/content.api');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderAt(routes: RouteObject[], path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const now = '2026-10-01T10:00:00.000Z';

const banner: Banner = {
  id: 'b1',
  tagline: null,
  title: 'Season 5',
  subtitle: null,
  brand_badge: null,
  image_url: 'https://cdn.example.com/season5.jpg',
  button_text: null,
  target_tab_index: 1,
  link_url: null,
  sort_order: 0,
  order: 0,
  is_active: true,
  starts_at: null,
  ends_at: null,
  created_at: now,
  updated_at: now,
};
const liveStream: LiveStream = {
  id: 'stream-1',
  title: 'Pro Series',
  subtitle: 'Grand Finals — Day 2',
  location: 'New Delhi, India',
  viewer_count: '12.4K',
  is_live: true,
  is_official: true,
  image_url: 'https://cdn.example.com/stream.png',
  stream_url: 'https://youtube.com/live/abc',
};
const partnerInquiry: PartnerInquiry = {
  id: 'inquiry-1',
  brand_name: 'Red Bull India',
  contact_name: 'Rohan Sharma',
  email: 'rohan@example.com',
  phone: '+91 9876543210',
  partnership_type: 'Title Sponsorship',
  message: 'We would like to discuss sponsorship opportunities.',
  created_at: now,
};
function pageOf(items: Banner[]): BannerPage {
  return { items, page: 1, limit: 20, total: items.length };
}

const routes: RouteObject[] = [
  { path: '/content', element: <ContentPage /> },
  { path: '/dashboard', element: <p>dashboard</p> },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('content — banners', () => {
  it('creates a banner via POST /admin/banners', async () => {
    vi.mocked(listBanners).mockResolvedValue(pageOf([banner]));
    vi.mocked(createBanner).mockResolvedValue({ ...banner, id: 'b-new' });
    renderAt(routes, '/content');

    // The Content page opens on the Banners tab; open its create modal.
    fireEvent.click(await screen.findByRole('button', { name: 'New banner' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/^Title/), {
      target: { value: 'Summer Splash' },
    });
    fireEvent.change(within(dialog).getByLabelText(/tagline/i), {
      target: { value: 'OFFICIAL TOURNAMENT SERIES' },
    });
    fireEvent.change(within(dialog).getByLabelText(/banner image/i), {
      target: { files: [new File(['image'], 'summer.png', { type: 'image/png' })] },
    });
    await within(dialog).findByAltText('Banner image preview');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create banner' }));

    await waitFor(() => expect(createBanner).toHaveBeenCalledTimes(1));
    expect(createBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Summer Splash',
        tagline: 'OFFICIAL TOURNAMENT SERIES',
        target_tab_index: 1,
        sort_order: 0,
        is_active: true,
      }),
      expect.any(File),
    );
  });

  it('shows the configured home live streams from the admin API', async () => {
    vi.mocked(listBanners).mockResolvedValue(pageOf([]));
    vi.mocked(listLiveStreams).mockResolvedValue([liveStream]);
    renderAt(routes, '/content');

    fireEvent.click(await screen.findByRole('tab', { name: 'Live streams' }));

    expect(await screen.findByText('Pro Series')).toBeTruthy();
    expect(screen.getByText('12.4K')).toBeTruthy();
    expect(listLiveStreams).toHaveBeenCalledTimes(1);
  });

  it('shows partner inquiries and contact details in the detail modal', async () => {
    vi.mocked(listBanners).mockResolvedValue(pageOf([]));
    vi.mocked(listPartnerInquiries).mockResolvedValue([partnerInquiry]);
    renderAt(routes, '/content');

    fireEvent.click(await screen.findByRole('tab', { name: 'Partner inquiries' }));
    expect(await screen.findByText('Red Bull India')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View' }));

    expect(await screen.findByText(partnerInquiry.message)).toBeTruthy();
    expect(screen.getByRole('link', { name: partnerInquiry.email }).getAttribute('href')).toBe(
      `mailto:${partnerInquiry.email}`,
    );
  });
});
