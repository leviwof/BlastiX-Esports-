import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveArenaPage } from './LiveArenaPage';

// Mock tournament hooks for BlastiX live panel
vi.mock('@/features/tournaments/tournaments.hooks', () => ({
  useTournaments: vi.fn(() => ({
    data: {
      items: [
        {
          id: 't-live-1',
          name: 'BlastiX Winter Invitational',
          status: 'LIVE',
          team_mode: 'SQUAD',
          format: 'BATTLE_ROYALE',
          game_slug: 'free_fire',
          max_teams: 12,
          current_teams: 12,
          start_time: '2026-10-02T12:00:00Z',
          prize_pool: 50000,
        },
      ],
      total: 1,
      page: 1,
      limit: 12,
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useUpdateTournamentStatus: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

describe('LiveArenaPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = (initialEntries = ['/live']) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <LiveArenaPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders Live Arena with segregated BlastiX Live and Free Fire MAX tabs', () => {
    renderComponent();

    // Verify main page title
    expect(screen.getByRole('heading', { name: /live arena/i })).toBeTruthy();

    // Verify tab buttons exist
    const blastixTab = screen.getByRole('tab', { name: /blastix live/i });
    const freeFireTab = screen.getByRole('tab', { name: /free fire max live/i });
    expect(blastixTab).toBeTruthy();
    expect(freeFireTab).toBeTruthy();

    // By default, BlastiX Live is selected
    expect(blastixTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/blastix internal live arena/i)).toBeTruthy();
    expect(screen.getByText(/active blastix live tournaments/i)).toBeTruthy();
  });

  it('switches to Free Fire MAX Live tab showing official Garena data and broadcast', async () => {
    renderComponent();

    const freeFireTab = screen.getByRole('tab', { name: /free fire max live/i });
    fireEvent.click(freeFireTab);

    // Now Free Fire MAX tab should be active
    expect(freeFireTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/free fire max official live center/i)).toBeTruthy();
    expect(screen.getByText(/official garena data/i)).toBeTruthy();

    // Official Free Fire tournament and points table should be rendered
    expect(screen.getByText(/ffws official points table/i)).toBeTruthy();
    expect(screen.getByText(/official free fire max tournaments/i)).toBeTruthy();
    expect(screen.getByText(/official free fire web portals/i)).toBeTruthy();
  });

  it('can open Free Fire MAX Live directly via ?source=freefire URL param', () => {
    renderComponent(['/live?source=freefire']);

    const freeFireTab = screen.getByRole('tab', { name: /free fire max live/i });
    expect(freeFireTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/free fire max official live center/i)).toBeTruthy();
  });
});
