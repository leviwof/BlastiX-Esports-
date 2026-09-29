import { PageHeader } from '@/components/shared/PageHeader';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/**
 * /leaderboards — standings are per tournament, so this is a picker: choose a
 * tournament to open its detail page, where the Leaderboard panel lives.
 */
function LeaderboardsHubPage() {
  return (
    <div>
      <PageHeader
        title="Leaderboards"
        description="Select a tournament to view its standings (computed from match results)."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Leaderboards' }]}
      />
      <TournamentBrowser
        cardTo={(t) => `/tournaments/${t.id}`}
        emptyTitle="No tournaments yet"
        emptyDescription="Standings appear once a tournament has recorded results."
      />
    </div>
  );
}

export { LeaderboardsHubPage };
