import { PageHeader } from '@/components/shared/PageHeader';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/** /live — tournaments currently in progress (status locked to LIVE). */
function LiveArenaPage() {
  return (
    <div>
      <PageHeader
        title="Live Arena"
        description="Tournaments currently in progress. Open one to manage room credentials, matches and results."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Live Arena' }]}
      />
      <TournamentBrowser
        lockedStatus="LIVE"
        emptyTitle="Nothing live right now"
        emptyDescription="Tournaments appear here once their status is set to Live."
      />
    </div>
  );
}

export { LiveArenaPage };
