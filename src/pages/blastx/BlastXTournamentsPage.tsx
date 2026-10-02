import { Link } from 'react-router-dom';
import { Plus, Zap, Radio } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/**
 * /blastx/tournaments — Manage BlastX E-Sports Tournaments.
 * Full list of BlastX tournaments (Upcoming, Registration, Live, Completed, Cancelled).
 * Tournaments managed here sync exclusively to the BlastX section of the mobile app.
 */
function BlastXTournamentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="⚡ Manage BlastX E-Sports Tournaments"
        description="View and manage all BlastX tournaments. Edit tournament details, update player rosters, configure room credentials, and delete/cancel tournaments."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'BlastX E-Sports', to: '/blastx/live' },
          { label: 'Manage' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/blastx/live">
                <Radio className="h-4 w-4 mr-1 text-primary animate-pulse" />
                Live Arena
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/blastx/tournaments/new">
                <Plus className="h-4 w-4 mr-1" />
                New BlastX Tournament
              </Link>
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Zap className="h-5 w-5 text-primary shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-foreground">BlastX Mobile App Integration:</span>{' '}
            <span className="text-foreground-muted">
              All tournaments created and managed in this section are tagged as BlastX E-Sports and show only in the BlastX section of player apps.
            </span>
          </div>
        </div>
      </div>

      <TournamentBrowser
        filterSection="blastx"
        showActions
        emptyTitle="No BlastX tournaments found"
        emptyDescription="Create your first BlastX tournament to start hosting competitive matches."
      />
    </div>
  );
}

export { BlastXTournamentsPage };
