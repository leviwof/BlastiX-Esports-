import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { UsersListPage } from '@/pages/UsersListPage';
import { ProfileBadgeControls } from '@/features/users/components/ProfileBadgeControls';
import { ApiError } from '@/lib/apiError';
import type { ManagedUser, UserPage } from '@/features/users/users.types';
import { listUsers, updateUser } from '@/features/users/users.api';

// The users API is mocked so each test drives the network explicitly; toasts are
// stubbed so success / error feedback needs no mounted Toaster.
vi.mock('@/features/users/users.api');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Render an isolated route tree (no auth shell) so the feature can be exercised. */
function renderAt(routes: RouteObject[], path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const now = '2026-10-01T10:00:00.000Z';

const androidUser: ManagedUser = {
  id: 'u1',
  name: 'Player One',
  email: 'p1@example.com',
  profile_pic: null,
  is_vip: false,
  crown_badge_unlocked: false,
  role: 'PLAYER',
  is_active: true,
  xp: 1500,
  rank: 3,
  created_at: now,
  updated_at: now,
  device_type: 'ANDROID',
  device_model: 'Samsung Galaxy S24',
};

const iosUser: ManagedUser = {
  id: 'u2',
  name: 'iPhone Player',
  email: 'iphone@example.com',
  profile_pic: null,
  is_vip: false,
  crown_badge_unlocked: false,
  role: 'PLAYER',
  is_active: true,
  xp: 800,
  rank: 12,
  created_at: now,
  updated_at: now,
  device_type: 'IOS',
  device_model: 'iPhone 15 Pro',
  ios_waitlist: true,
  ios_notified_at: null,
};

function pageOf(items: ManagedUser[]): UserPage {
  return { items, page: 1, limit: 20, total: items.length };
}

const routes: RouteObject[] = [
  { path: '/users', element: <UsersListPage /> },
  { path: '/profile-badges', element: <ProfileBadgeControls user={androidUser} /> },
  { path: '/users/:id', element: <p>detail placeholder</p> },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('user list', () => {
  it('renders users from GET /admin/users with device badges', async () => {
    vi.mocked(listUsers).mockResolvedValue(pageOf([androidUser, iosUser]));
    renderAt(routes, '/users');
    expect(await screen.findByText('Player One')).toBeTruthy();
    expect(screen.getByText('iPhone Player')).toBeTruthy();
    expect(screen.getByText('Android')).toBeTruthy();
    expect(screen.getByText('iOS')).toBeTruthy();
    expect(screen.getByText(/waitlist \(pending\)/i)).toBeTruthy();
    expect(listUsers).toHaveBeenCalled();
  });

  it('shows the empty state when there are no users', async () => {
    vi.mocked(listUsers).mockResolvedValue(pageOf([]));
    renderAt(routes, '/users');
    expect(await screen.findByText(/no users found/i)).toBeTruthy();
  });

  it("shows the error state when GET /admin/users fails", async () => {
    vi.mocked(listUsers).mockRejectedValue(new ApiError('Server error', { status: 500 }));
    renderAt(routes, '/users');
    expect(await screen.findByText(/couldn't load users/i)).toBeTruthy();
  });
});

describe('user moderation & device actions', () => {
  it('updates VIP status through PATCH /admin/users/:id', async () => {
    vi.mocked(updateUser).mockResolvedValue({ ...androidUser, is_vip: true });
    renderAt(routes, '/profile-badges');

    fireEvent.click(screen.getByRole('switch', { name: /vip status/i }));

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith('u1', { is_vip: true }));
  });

  it('bans a user via PATCH /admin/users/:id after confirming the dialog', async () => {
    vi.mocked(listUsers).mockResolvedValue(pageOf([androidUser]));
    vi.mocked(updateUser).mockResolvedValue({ ...androidUser, is_active: false });
    renderAt(routes, '/users');

    // The per-row action opens a confirm dialog; the PATCH fires only on confirm.
    fireEvent.click(await screen.findByRole('button', { name: 'Ban' }));
    expect(updateUser).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ban user' }));

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith('u1', { is_active: false }));
  });

  it('opens the Notify iOS Waitlist modal', async () => {
    vi.mocked(listUsers).mockResolvedValue(pageOf([iosUser]));
    renderAt(routes, '/users');

    const notifyBtns = await screen.findAllByRole('button', { name: /notify ios waitlist/i });
    fireEvent.click(notifyBtns[0]);

    expect(await screen.findByRole('heading', { name: /notify ios waitlist players/i })).toBeTruthy();
    expect(screen.getByDisplayValue(/BlastIX Esports is now officially available on iOS!/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send launch notification/i })).toBeTruthy();
  });
});
