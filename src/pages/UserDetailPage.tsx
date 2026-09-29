import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { UserActions } from '@/features/users/components/UserActions';
import { useUser } from '@/features/users/users.hooks';
import { formatDateTime } from '@/lib/format';
import { getInitials } from '@/lib/utils';

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="text-sm text-foreground-soft">{value}</dd>
    </div>
  );
}

/** Single-user profile with XP / rank and the ban / role moderation actions. */
function UserDetailPage() {
  const { id = '' } = useParams();
  const { data: user, isPending, isError, error, refetch } = useUser(id);

  if (isPending) return <LoadingState label="Loading user…" />;
  if (isError) {
    return <ErrorState title="Couldn't load user" error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.email}
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Users', to: '/users' },
          { label: user.name },
        ]}
        actions={<UserActions user={user} size="default" />}
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
          <Badge variant={user.is_active ? 'success' : 'danger'}>
            {user.is_active ? 'Active' : 'Banned'}
          </Badge>
        </div>

        <SectionCard title="Profile">
          <div className="mb-6 flex items-center gap-4">
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-xl text-primary">
                {getInitials(user.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{user.name}</p>
              <p className="truncate text-sm text-foreground-muted">{user.email}</p>
            </div>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Status" value={user.is_active ? 'Active' : 'Banned'} />
            <InfoRow label="XP" value={user.xp.toLocaleString()} />
            <InfoRow label="Rank" value={user.rank ? `#${user.rank}` : '—'} />
            <InfoRow
              label="User ID"
              value={<span className="font-mono text-xs">{user.id}</span>}
            />
            <InfoRow label="Joined" value={formatDateTime(user.created_at)} />
            <InfoRow label="Last updated" value={formatDateTime(user.updated_at)} />
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}

export { UserDetailPage };
