import { Link } from 'react-router-dom';
import { Plus, Swords } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { BlastixLivePanel } from '@/features/live/blastix/components/BlastixLivePanel';

/**
 * /blastx/live — BlastX E-Sports Live Tournaments Arena.
 * Real-time monitoring and controls for BlastX live tournaments, room credentials, and match scoring.
 */
function BlastXLivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="⚡ BlastX E-Sports Live Tournaments"
        description="Monitor and control all active BlastX tournaments. Release room passwords, record kills & placement, and finalize leaderboards."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'BlastX E-Sports', to: '/blastx/tournaments' },
          { label: 'Live Arena' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/matches">
                <Swords className="h-4 w-4 mr-1 text-primary" />
                Matches Hub
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

      <BlastixLivePanel />
    </div>
  );
}

export { BlastXLivePage };
