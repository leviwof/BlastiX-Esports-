import { useState } from 'react';
import { Search, Users2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/Pagination';
import { useTeams } from '@/features/teams/teams.hooks';
import { TeamsTable } from '@/features/teams/components/TeamsTable';

const PAGE_SIZE = 20;

/**
 * Read-only team directory — server-side searchable and paginated. Rows open
 * the roster detail. Changing the search resets to page 1 so results stay
 * coherent.
 */
function TeamsListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch, isFetching } = useTeams({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
  });

  const changeSearch = (next: string) => {
    setSearch(next);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Browse player teams and their rosters."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Teams' }]}
      />

      <div className="space-y-4">
        <div className="relative min-w-0 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search teams by name or tag"
            placeholder="Search by name or tag…"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <SectionCard contentClassName="p-0">
          {isPending ? (
            <LoadingState label="Loading teams…" />
          ) : isError ? (
            <ErrorState title="Couldn't load teams" error={error} onRetry={() => void refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState icon={Users2} title="No teams found" description="Try adjusting your search." />
          ) : (
            <>
              <TeamsTable teams={data.items} />
              <Pagination
                page={page}
                limit={PAGE_SIZE}
                total={data.total}
                onPageChange={setPage}
                disabled={isFetching}
                className="px-5 pb-4"
              />
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export { TeamsListPage };
