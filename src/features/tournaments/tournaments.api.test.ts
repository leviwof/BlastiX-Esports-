import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/apiClient';
import { getLeaderboard } from './tournaments.api';

describe('getLeaderboard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('normalizes the deployed wrapped leaderboard response to an array', async () => {
    const entries = [{ rank: 1, registration_id: 'registration-1' }];
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { leaderboard: entries } });

    await expect(getLeaderboard('tournament-1')).resolves.toEqual(entries);
  });

  it('rejects an invalid payload so React Query renders its error state', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { unexpected: [] } });

    await expect(getLeaderboard('tournament-1')).rejects.toThrow(
      'The leaderboard response has an unexpected format.',
    );
  });
});
