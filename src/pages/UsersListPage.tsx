import { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useUsers } from '@/features/users/users.hooks';
import {
  UsersFilters,
  emptyUserFilters,
  type UserFilterState,
} from '@/features/users/components/UsersFilters';
import { UsersTable } from '@/features/users/components/UsersTable';

const PAGE_SIZE = 20;

/**
 * User management — server-side searchable / filterable, paginated list. Ban and
 * role actions live per-row (see `UserActions`); changing any filter resets to
 * page 1 so the result set stays coherent.
 */
function UsersListPage() {
  const [filters, setFilters] = useState<UserFilterState>(emptyUserFilters);
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch, isFetching } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: filters.search.trim() || undefined,
    role: filters.role || undefined,
    is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
  });

  const changeFilters = (next: UserFilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="View, search and moderate player accounts."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Users' }]}
      />

      <div className="space-y-4">
        <UsersFilters value={filters} onChange={changeFilters} />

        <SectionCard contentClassName="p-0">
          {isPending ? (
            <LoadingState label="Loading users…" />
          ) : isError ? (
            <ErrorState title="Couldn't load users" error={error} onRetry={() => void refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <UsersTable users={data.items} />
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

export { UsersListPage };
