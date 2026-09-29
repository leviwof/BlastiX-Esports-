import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { ContentPage } from '@/pages/ContentPage';
import type { Banner, BannerPage } from '@/features/content/content.types';
import { createBanner, listBanners } from '@/features/content/content.api';

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
  title: 'Season 5',
  image_url: 'https://cdn.example.com/season5.jpg',
  link_url: null,
  sort_order: 0,
  is_active: true,
  starts_at: null,
  ends_at: null,
  created_at: now,
  updated_at: now,
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
    fireEvent.change(within(dialog).getByLabelText(/title/i), {
      target: { value: 'Summer Splash' },
    });
    fireEvent.change(within(dialog).getByLabelText(/image url/i), {
      target: { value: 'https://cdn.example.com/summer.jpg' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create banner' }));

    await waitFor(() => expect(createBanner).toHaveBeenCalledTimes(1));
    expect(createBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Summer Splash',
        image_url: 'https://cdn.example.com/summer.jpg',
        sort_order: 0,
        is_active: true,
      }),
    );
  });
});

