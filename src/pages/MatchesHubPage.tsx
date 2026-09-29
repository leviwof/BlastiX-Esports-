import { PageHeader } from '@/components/shared/PageHeader';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/**
 * /matches — matches are managed per tournament, so this is a picker: choose a
 * tournament to open its detail page, where the Matches panel lives.
 */
function MatchesHubPage() {
  return (
    <div>
      <PageHeader
        title="Matches"
        description="Select a tournament to create matches and record results."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Matches' }]}
      />
      <TournamentBrowser
        cardTo={(t) => `/tournaments/${t.id}`}
        emptyTitle="No tournaments yet"
        emptyDescription="Create a tournament first, then add matches to it."
      />
    </div>
  );
}

export { MatchesHubPage };
