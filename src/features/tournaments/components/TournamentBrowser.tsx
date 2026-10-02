import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTournaments } from '../tournaments.hooks';
import { TournamentCard } from './TournamentCard';
import { getTournamentSection, type TournamentSection } from '../tournament.section';
import {
  TournamentFilters,
  emptyFilters,
  type TournamentFilterState,
} from './TournamentFilters';
import type { TournamentListItem, TournamentStatus } from '../tournaments.types';

export interface TournamentBrowserProps {
  /** Force a status (hides the status filter) — used by the Live view. */
  lockedStatus?: TournamentStatus;
  /** Restricts results to only Free Fire Live or BlastX E-Sports tournaments. */
  filterSection?: TournamentSection;
  /** Link target per card (defaults to the detail page). */
  cardTo?: (t: TournamentListItem) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  /** Whether to render quick edit, players, and cancel buttons on each card. */
  showActions?: boolean;
}

/**
 * Reusable paginated tournament list: filters (server-side) + a client-side
 * title search over the loaded page, with loading / error / empty states. Used
 * by the Tournaments list, the Live arena and the match / leaderboard pickers.
 */
function TournamentBrowser({
  lockedStatus,
  filterSection,
  cardTo,
  emptyTitle = 'No tournaments yet',
  emptyDescription = 'Tournaments you create will appear here.',
  pageSize = 12,
  showActions = false,
}: TournamentBrowserProps) {
  const [filters, setFilters] = useState<TournamentFilterState>(emptyFilters);
  const [page, setPage] = useState(1);

  const query = {
    page,
    limit: pageSize,
    status: lockedStatus ?? (filters.status || undefined),
    team_mode: filters.team_mode || undefined,
    format: filters.format || undefined,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useTournaments(query);

  // Reset to the first page whenever the server-side filters change.
  const changeFilters = (next: TournamentFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const term = filters.search.trim().toLowerCase();
  const visible = useMemo(() => {
    let items = data?.items ?? [];
    if (filterSection) {
      items = items.filter((t) => getTournamentSection(t) === filterSection);
    }
    if (!term) return items;
    return items.filter((t) => t.title.toLowerCase().includes(term));
  }, [data?.items, term, filterSection]);

  const total = filterSection ? visible.length : (data?.total ?? 0);

  return (
    <div className="space-y-4">
      <TournamentFilters value={filters} onChange={changeFilters} hideStatus={Boolean(lockedStatus)} />

      {isPending ? (
        <LoadingState label="Loading tournaments…" />
      ) : isError ? (
        <ErrorState title="Couldn't load tournaments" error={error} onRetry={() => void refetch()} />
      ) : visible.length === 0 ? (
        term ? (
          <EmptyState
            icon={Trophy}
            title="No matches on this page"
            description="No tournament on the current page matches your search. Try clearing the search or moving to another page."
          />
        ) : (
          <EmptyState icon={Trophy} title={emptyTitle} description={emptyDescription} />
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((t) => (
              <TournamentCard key={t.id} tournament={t} to={cardTo?.(t)} showActions={showActions} />
            ))}
          </div>

          <Pagination
            page={page}
            limit={pageSize}
            total={total}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      )}
    </div>
  );
}

export { TournamentBrowser };
