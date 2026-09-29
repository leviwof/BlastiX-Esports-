import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { routes } from './app/router';
import { setToken, clearToken } from './lib/apiClient';
import { useAuthStore } from './features/auth/auth.store';
import { getMe } from './features/auth/auth.api';
import type { UserResponse } from './features/auth/auth.types';

// The API layer is mocked so the shell can be exercised without a live backend.
vi.mock('./features/auth/auth.api');

// The dashboard reads the tournaments list; keep it offline with an empty page.
vi.mock('./features/tournaments/tournaments.api', () => ({
  getTournaments: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
}));

// The dashboard KPI tiles read GET /admin/stats; stub it so the render stays hermetic.
vi.mock('./features/stats/stats.api', () => ({
  getStats: vi.fn().mockResolvedValue({
    users: { total: 0, active: 0, admins: 0 },
    tournaments: { total: 0, live: 0, upcoming: 0, by_status: {} },
    teams: { total: 0 },
    registrations: { total: 0, confirmed: 0 },
    proofs: { pending: 0 },
    challenges: { active: 0 },
  }),
}));

const adminUser: UserResponse = {
  id: 'u1',
  name: 'Site Admin',
  email: 'admin@blastixesports.com',
  role: 'ADMIN',
  profile_pic: null,
  is_active: true,
};

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}

describe('app shell routing', () => {
  beforeEach(() => {
    clearToken();
    useAuthStore.setState({ status: 'initializing', admin: null });
    vi.clearAllMocks();
  });

  it('shows the login screen (with the BlastIX brand) to a signed-out visitor', async () => {
    // No stored token → bootstrap resolves to unauthenticated → login form.
    renderAt('/login');
    expect(await screen.findByRole('button', { name: /send login code/i })).toBeTruthy();
    expect(screen.getByAltText(/blastix/i)).toBeTruthy();
  });

  it('restores an admin session from a stored token and renders the dashboard', async () => {
    setToken('jwt_admin');
    vi.mocked(getMe).mockResolvedValue(adminUser);
    renderAt('/dashboard');
    // ProtectedRoute shows the splash until GET /users/me resolves, then the shell.
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeTruthy();
  });
});
