import { Link } from 'react-router-dom';
import { Plus, Radio } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/**
 * /freefire/tournaments — Manage Free Fire Tournaments.
 * Full list of Free Fire tournaments (Upcoming, Registration, Live, Completed, Cancelled).
 * Tournaments managed here sync exclusively to the Free Fire Live section of the mobile app.
 */
function FreeFireTournamentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="🔥 Manage Free Fire Tournaments"
        description="View and manage all Free Fire tournaments. Edit settings, update players, assign custom room IDs, and record match results."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Free Fire Live', to: '/freefire/live' },
          { label: 'Manage' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/freefire/live">
                <Radio className="h-4 w-4 mr-1 text-red-500 animate-pulse" />
                Live Arena
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link to="/freefire/tournaments/new">
                <Plus className="h-4 w-4 mr-1" />
                New FF Tournament
              </Link>
            </Button>
          </div>
        }
      />

      <TournamentBrowser
        filterSection="freefire"
        showActions
        emptyTitle="No Free Fire tournaments found"
        emptyDescription="Create your first Free Fire tournament to start organizing competitive matches."
      />
    </div>
  );
}

export { FreeFireTournamentsPage };
