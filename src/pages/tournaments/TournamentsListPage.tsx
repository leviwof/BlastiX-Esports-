import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';

/** /tournaments — the full paginated, filterable tournament list. */
function TournamentsListPage() {
  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Create, edit and operate tournaments."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Tournaments' }]}
        actions={
          <Button asChild>
            <Link to="/tournaments/new">
              <Plus className="h-4 w-4" />
              New tournament
            </Link>
          </Button>
        }
      />
      <TournamentBrowser
        emptyTitle="No tournaments yet"
        emptyDescription="Create your first tournament to get started."
      />
    </div>
  );
}

export { TournamentsListPage };
