import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { toast } from 'sonner';
import { TournamentsListPage } from '@/pages/tournaments/TournamentsListPage';
import { TournamentCreatePage } from '@/pages/tournaments/TournamentCreatePage';
import { TournamentDetailPage } from '@/pages/tournaments/TournamentDetailPage';
import { TournamentCard } from '@/features/tournaments/components/TournamentCard';
import { ApiError } from '@/lib/apiError';
import type {
  Match,
  Tournament,
  TournamentPage,
  TournamentRegistration,
} from '@/features/tournaments/tournaments.types';
import {
  createMatch,
  createTournament,
  finalizeTournament,
  getLeaderboard,
  getMatches,
  getParticipants,
  getTournament,
  getTournaments,
  recordMatchResults,
  setRoomCredentials,
  updateTournamentStatus,
} from '@/features/tournaments/tournaments.api';

// The network layer is mocked; each test drives it explicitly. Toasts are
// mocked so success / error feedback can be asserted without a mounted Toaster.
vi.mock('@/features/tournaments/tournaments.api');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Render an isolated route tree (no auth shell) so a feature can be exercised. */
function renderAt(routes: RouteObject[], path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const now = '2026-10-01T10:00:00.000Z';

const tournament: Tournament = {
  id: 't1',
  game_id: 'g1',
  game_slug: 'free_fire',
  title: 'BlastIX Weekly Cup',
  description: 'Weekly squad showdown.',
  banner_url: null,
  format: 'BATTLE_ROYALE',
  team_mode: 'SQUAD',
  map: 'Bermuda',
  max_slots: 12,
  registered_count: 1,
  slots_left: 11,
  entry_fee: 0,
  prize_pool: 1000,
  prize_distribution: null,
  rules: ['No teaming'],
  registration_opens_at: now,
  registration_closes_at: now,
  starts_at: now,
  status: 'DRAFT',
  created_by: 'u1',
  created_at: now,
  updated_at: now,
};

const registration: TournamentRegistration = {
  id: 'p1',
  tournament_id: 't1',
  user_id: 'u2',
  team_id: null,
  status: 'CONFIRMED',
  slot_number: 1,
  final_rank: null,
  created_at: now,
  user: { id: 'u2', name: 'Player One', email: 'p1@example.com' },
  team: null,
};

const match: Match = {
  id: 'm1',
  tournament_id: 't1',
  match_number: 1,
  map: 'Bermuda',
  status: 'SCHEDULED',
  scheduled_at: now,
  created_at: now,
  results: [],
};

function pageOf(items: Tournament[]): TournamentPage {
  return { items, page: 1, limit: 12, total: items.length };
}

/** Resolve all four reads the detail page fires so it renders fully. */
function seedDetailReads(): void {
  vi.mocked(getTournament).mockResolvedValue(tournament);
  vi.mocked(getParticipants).mockResolvedValue([registration]);
  vi.mocked(getMatches).mockResolvedValue([match]);
  vi.mocked(getLeaderboard).mockResolvedValue([]);
}

const detailRoutes: RouteObject[] = [
  { path: '/tournaments/:id', element: <TournamentDetailPage /> },
];

beforeEach(() => {
  vi.clearAllMocks();
});

const listRoutes: RouteObject[] = [
  { path: '/tournaments', element: <TournamentsListPage /> },
];

describe('tournament list', () => {
  it('renders tournaments from GET /tournaments', async () => {
    vi.mocked(getTournaments).mockResolvedValue(pageOf([tournament]));
    renderAt(listRoutes, '/tournaments');
    expect(await screen.findByText('BlastIX Weekly Cup')).toBeTruthy();
    expect(getTournaments).toHaveBeenCalled();
  });

  it('shows the loading state while the request is in flight', () => {
    vi.mocked(getTournaments).mockReturnValue(new Promise<TournamentPage>(() => {}));
    renderAt(listRoutes, '/tournaments');
    expect(screen.getByText(/loading tournaments/i)).toBeTruthy();
  });

  it('shows the empty state when there are no tournaments', async () => {
    vi.mocked(getTournaments).mockResolvedValue(pageOf([]));
    renderAt(listRoutes, '/tournaments');
    expect(await screen.findByText(/no tournaments yet/i)).toBeTruthy();
  });

  it('shows the error state when GET /tournaments fails', async () => {
    vi.mocked(getTournaments).mockRejectedValue(new ApiError('Server error', { status: 500 }));
    renderAt(listRoutes, '/tournaments');
    expect(await screen.findByText(/couldn't load tournaments/i)).toBeTruthy();
  });

  it('publishes room credentials immediately from a manage tournament card', async () => {
    vi.mocked(setRoomCredentials).mockResolvedValue({
      ...tournament,
      room_id: 'RM123',
      room_password: 'secret',
      room_released_at: now,
    });
    renderAt(
      [{ path: '/', element: <TournamentCard tournament={tournament} showActions /> }],
      '/',
    );

    fireEvent.change(screen.getByLabelText('Room ID for BlastIX Weekly Cup'), {
      target: { value: 'RM123' },
    });
    fireEvent.change(screen.getByLabelText('Room password for BlastIX Weekly Cup'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish room to players' }));

    await waitFor(() =>
      expect(setRoomCredentials).toHaveBeenCalledWith('t1', {
        room_id: 'RM123',
        room_password: 'secret',
        release_now: true,
      }),
    );
  });
});

const createRoutes: RouteObject[] = [
  { path: '/tournaments/new', element: <TournamentCreatePage /> },
  { path: '/tournaments/:id', element: <p>detail placeholder</p> },
  { path: '/tournaments', element: <p>list placeholder</p> },
];

/** Fill the minimum required create-form fields (numbers keep their defaults). */
function fillCreateForm(): void {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Cup' } });
  fireEvent.change(screen.getByLabelText(/^map/i), { target: { value: 'Bermuda' } });
  fireEvent.change(screen.getByLabelText(/registration opens/i), {
    target: { value: '2026-10-01T10:00' },
  });
  fireEvent.change(screen.getByLabelText(/registration closes/i), {
    target: { value: '2026-10-02T10:00' },
  });
  fireEvent.change(screen.getByLabelText(/starts at/i), { target: { value: '2026-10-03T10:00' } });
}

describe('tournament creation', () => {
  it('creates a tournament via POST /admin/tournaments and navigates to it', async () => {
    vi.mocked(createTournament).mockResolvedValue({ ...tournament, id: 't-new' });
    renderAt(createRoutes, '/tournaments/new');

    fillCreateForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create tournament' }));

    await waitFor(() => expect(createTournament).toHaveBeenCalledTimes(1));
    expect(createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Cup',
        map: 'Bermuda',
        format: 'BATTLE_ROYALE',
        team_mode: 'SQUAD',
        max_slots: 12,
        game_slug: 'free_fire',
      }),
    );
    expect(await screen.findByText('detail placeholder')).toBeTruthy();
  });

  it('surfaces an error and stays on the form when creation fails', async () => {
    vi.mocked(createTournament).mockRejectedValue(
      new ApiError('Title already taken', { status: 400 }),
    );
    renderAt(createRoutes, '/tournaments/new');

    fillCreateForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create tournament' }));

    await waitFor(() => expect(createTournament).toHaveBeenCalledTimes(1));
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(screen.queryByText('detail placeholder')).toBeNull();
    expect(screen.getByRole('button', { name: 'Create tournament' })).toBeTruthy();
  });
});

describe('tournament detail controls', () => {
  it('changes status via POST /admin/tournaments/:id/status', async () => {
    seedDetailReads();
    vi.mocked(updateTournamentStatus).mockResolvedValue(tournament);
    renderAt(detailRoutes, '/tournaments/t1');

    const select = await screen.findByLabelText('Status');
    fireEvent.change(select, { target: { value: 'UPCOMING' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply status' }));

    await waitFor(() =>
      expect(updateTournamentStatus).toHaveBeenCalledWith('t1', { status: 'UPCOMING' }),
    );
  });

  it('finalizes only after the confirmation dialog is confirmed', async () => {
    seedDetailReads();
    vi.mocked(finalizeTournament).mockResolvedValue({ tournament_id: 't1', final_standings: [] });
    renderAt(detailRoutes, '/tournaments/t1');

    fireEvent.click(await screen.findByRole('button', { name: 'Finalize standings' }));
    expect(finalizeTournament).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Finalize' }));
    await waitFor(() => expect(finalizeTournament).toHaveBeenCalledWith('t1'));
  });

  it('sets room credentials via POST /admin/tournaments/:id/room', async () => {
    seedDetailReads();
    vi.mocked(setRoomCredentials).mockResolvedValue(tournament);
    renderAt(detailRoutes, '/tournaments/t1');

    fireEvent.click(await screen.findByRole('button', { name: 'Set room' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/room id/i), { target: { value: 'RM123' } });
    fireEvent.change(within(dialog).getByLabelText(/room password/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(setRoomCredentials).toHaveBeenCalledWith('t1', {
        room_id: 'RM123',
        room_password: 'secret',
        release_now: false,
      }),
    );
  });

  it('creates a match via POST /admin/tournaments/:id/matches', async () => {
    seedDetailReads();
    vi.mocked(createMatch).mockResolvedValue(match);
    renderAt(detailRoutes, '/tournaments/t1');

    fireEvent.click(await screen.findByRole('button', { name: 'Create match' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/scheduled at/i), {
      target: { value: '2026-10-05T18:00' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create match' }));

    await waitFor(() =>
      expect(createMatch).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ match_number: 2, map: 'Bermuda' }),
      ),
    );
  });

  it('records match results via POST /admin/matches/:matchId/results', async () => {
    seedDetailReads();
    vi.mocked(recordMatchResults).mockResolvedValue([]);
    renderAt(detailRoutes, '/tournaments/t1');

    fireEvent.click(await screen.findByRole('button', { name: 'Record results' }));
    fireEvent.change(await screen.findByLabelText('Placement for Player One'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Kills for Player One'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save results' }));

    await waitFor(() =>
      expect(recordMatchResults).toHaveBeenCalledWith('m1', {
        results: [{ registration_id: 'p1', placement: 1, kills: 5 }],
      }),
    );
  });
});
