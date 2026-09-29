import { useState } from 'react';
import { Apple, Bell, Smartphone, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { useUsers } from '@/features/users/users.hooks';
import {
  UsersFilters,
  emptyUserFilters,
  type UserFilterState,
} from '@/features/users/components/UsersFilters';
import { UsersTable } from '@/features/users/components/UsersTable';
import { NotifyIosModal } from '@/features/users/components/NotifyIosModal';

const PAGE_SIZE = 20;

/**
 * User management — server-side searchable / filterable, paginated list with
 * device tracking (Android, iPhone/iOS) and iOS waitlist notification capabilities.
 */
function UsersListPage() {
  const [filters, setFilters] = useState<UserFilterState>(emptyUserFilters);
  const [page, setPage] = useState(1);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const { data, isPending, isError, error, refetch, isFetching } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: filters.search.trim() || undefined,
    role: filters.role || undefined,
    is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
    device_type: filters.device_type || undefined,
    ios_waitlist: filters.ios_waitlist === 'true' ? true : undefined,
  });

  const changeFilters = (next: UserFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const iosWaitlistCount =
    data?.items?.filter(
      (u) =>
        (u.device_type === 'IOS' || (u.device_type && u.device_type.toUpperCase() === 'IPHONE') || u.ios_waitlist) &&
        !u.ios_notified_at,
    ).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Users"
        description="View, search and moderate player accounts across Android and iOS devices."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Users' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNotifyOpen(true)}
            className="border-primary/40 hover:bg-primary/10"
          >
            <Apple className="mr-1.5 h-4 w-4 text-foreground" />
            <Bell className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Notify iOS Waitlist
          </Button>
        }
      />

      <div className="space-y-4">
        {/* iOS Early Access / Device Capture Info Banner */}
        <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>Multi-Device Tracking & iOS Early Access</span>
              </h3>
              <p className="text-xs text-foreground-muted">
                Capturing device types on signup. Since iPhone is not yet fully released, iOS player data is safely captured on a waitlist so you can notify them once support is live.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {filters.device_type !== 'IOS' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:underline h-8 px-2"
                onClick={() => changeFilters({ ...filters, device_type: 'IOS' })}
              >
                View iPhone Users →
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsNotifyOpen(true)}
              className="h-8 text-xs font-medium"
            >
              Launch Announcement
            </Button>
          </div>
        </div>

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
              description="Try adjusting your search, device, or status filters."
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

      <NotifyIosModal
        open={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        waitlistCount={iosWaitlistCount}
      />
    </div>
  );
}

export { UsersListPage };
