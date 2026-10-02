import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FreeFireTournamentsPage } from './FreeFireTournamentsPage';
import { FreeFireTournamentCreatePage } from './FreeFireTournamentCreatePage';
import { BlastXTournamentsPage } from '../blastx/BlastXTournamentsPage';
import { BlastXTournamentCreatePage } from '../blastx/BlastXTournamentCreatePage';
import { createTournament, getTournaments } from '@/features/tournaments/tournaments.api';

vi.mock('@/features/tournaments/tournaments.api');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const dummyTournaments = [
  {
    id: 't-ff-1',
    title: '[FF Live] FFWS Championship',
    status: 'LIVE',
    game_slug: 'free_fire',
    team_mode: 'SQUAD',
    format: 'BATTLE_ROYALE',
    map: 'Bermuda',
    max_slots: 12,
    registered_count: 12,
    slots_left: 0,
    entry_fee: 0,
    prize_pool: 100000,
    registration_opens_at: '2026-10-01T10:00:00.000Z',
    registration_closes_at: '2026-10-02T10:00:00.000Z',
    starts_at: '2026-10-03T10:00:00.000Z',
    created_by: 'admin',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 't-bx-1',
    title: '[BlastX] Winter Clan Wars',
    status: 'UPCOMING',
    game_slug: 'free_fire',
    team_mode: 'SQUAD',
    format: 'BATTLE_ROYALE',
    map: 'Purgatory',
    max_slots: 12,
    registered_count: 6,
    slots_left: 6,
    entry_fee: 50,
    prize_pool: 25000,
    registration_opens_at: '2026-10-01T10:00:00.000Z',
    registration_closes_at: '2026-10-02T10:00:00.000Z',
    starts_at: '2026-10-03T10:00:00.000Z',
    created_by: 'admin',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
  },
];

describe('Free Fire Live & BlastX Separate Tournament Management', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.mocked(getTournaments).mockResolvedValue({
      items: dummyTournaments as any,
      total: dummyTournaments.length,
      page: 1,
      limit: 12,
    });
  });

  it('FreeFireTournamentsPage lists only Free Fire Live tournaments', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FreeFireTournamentsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /manage free fire tournaments/i })).toBeTruthy();
    expect(await screen.findByText('FFWS Championship')).toBeTruthy();
    // BlastX tournament should not be shown in Free Fire section
    expect(screen.queryByText('Winter Clan Wars')).toBeNull();
  });

  it('BlastXTournamentsPage lists only BlastX tournaments', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BlastXTournamentsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /manage blastx e-sports tournaments/i })).toBeTruthy();
    expect(await screen.findByText('Winter Clan Wars')).toBeTruthy();
    // Free Fire tournament should not be shown in BlastX section
    expect(screen.queryByText('FFWS Championship')).toBeNull();
  });

  it('FreeFireTournamentCreatePage tags tournament with [FF Live]', async () => {
    vi.mocked(createTournament).mockResolvedValue({ ...dummyTournaments[0], id: 'new-ff' } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FreeFireTournamentCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'City Qualifiers' } });
    fireEvent.change(screen.getByLabelText(/^map/i), { target: { value: 'Bermuda' } });
    fireEvent.change(screen.getByLabelText(/registration opens/i), { target: { value: '2026-10-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/registration closes/i), { target: { value: '2026-10-02T10:00' } });
    fireEvent.change(screen.getByLabelText(/starts at/i), { target: { value: '2026-10-03T10:00' } });

    fireEvent.click(screen.getByRole('button', { name: /create free fire tournament/i }));

    await waitFor(() => expect(createTournament).toHaveBeenCalledTimes(1));
    expect(createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '[FF Live] City Qualifiers',
      }),
    );
  });

  it('BlastXTournamentCreatePage tags tournament with [BlastX]', async () => {
    vi.mocked(createTournament).mockResolvedValue({ ...dummyTournaments[1], id: 'new-bx' } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BlastXTournamentCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Pro League Cup' } });
    fireEvent.change(screen.getByLabelText(/^map/i), { target: { value: 'Purgatory' } });
    fireEvent.change(screen.getByLabelText(/registration opens/i), { target: { value: '2026-10-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/registration closes/i), { target: { value: '2026-10-02T10:00' } });
    fireEvent.change(screen.getByLabelText(/starts at/i), { target: { value: '2026-10-03T10:00' } });

    fireEvent.click(screen.getByRole('button', { name: /create blastx tournament/i }));

    await waitFor(() => expect(createTournament).toHaveBeenCalledTimes(1));
    expect(createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '[BlastX] Pro League Cup',
      }),
    );
  });
});
