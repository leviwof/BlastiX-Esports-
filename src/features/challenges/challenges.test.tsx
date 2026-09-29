import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { ChallengesListPage } from '@/pages/ChallengesListPage';
import type { Challenge, ChallengePage } from '@/features/challenges/challenges.types';
import { createChallenge, listChallenges } from '@/features/challenges/challenges.api';

// Network is mocked; toasts are stubbed so mutation feedback needs no Toaster.
vi.mock('@/features/challenges/challenges.api');
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

// One existing challenge so the list renders rows (and only the header "New
// challenge" button shows, not the empty-state one) before we open the form.
const challenge: Challenge = {
  id: 'c1',
  title: 'Existing challenge',
  description: 'Already there.',
  reward_xp: 50,
  target_progress: 1,
  game: 'Free Fire',
  type: 'DAILY',
  requires_recording: true,
  game_package: 'com.dts.freefireth',
  icon_asset: null,
  is_active: true,
  created_at: now,
};
function pageOf(items: Challenge[]): ChallengePage {
  return { items, page: 1, limit: 20, total: items.length };
}

const routes: RouteObject[] = [{ path: '/challenges', element: <ChallengesListPage /> }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('challenge creation', () => {
  it('creates a challenge via POST /admin/challenges with the DTO', async () => {
    vi.mocked(listChallenges).mockResolvedValue(pageOf([challenge]));
    vi.mocked(createChallenge).mockResolvedValue({ ...challenge, id: 'c-new' });
    renderAt(routes, '/challenges');

    // Open the create modal (numeric / enum fields keep their sensible defaults).
    fireEvent.click(await screen.findByRole('button', { name: 'New challenge' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/title/i), { target: { value: 'Daily Win' } });
    fireEvent.change(within(dialog).getByLabelText(/description/i), {
      target: { value: 'Win a match today.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create challenge' }));

    await waitFor(() => expect(createChallenge).toHaveBeenCalledTimes(1));
    expect(createChallenge).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Daily Win',
        description: 'Win a match today.',
        reward_xp: 100,
        target_progress: 1,
        game: 'Free Fire',
        type: 'DAILY',
        requires_recording: true,
        game_package: 'com.dts.freefireth',
      }),
    );
  });
});

