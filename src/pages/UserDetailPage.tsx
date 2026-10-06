import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Apple, Bell } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeviceBadge } from '@/features/users/components/DeviceBadge';
import { NotifyIosModal } from '@/features/users/components/NotifyIosModal';
import { ProfileBadgeControls } from '@/features/users/components/ProfileBadgeControls';
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

/** Single-user profile with XP / rank, device tracking, and moderation actions. */
function UserDetailPage() {
  const { id = '' } = useParams();
  const { data: user, isPending, isError, error, refetch } = useUser(id);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  if (isPending) return <LoadingState label="Loading user…" />;
  if (isError) {
    return <ErrorState title="Couldn't load user" error={error} onRetry={() => void refetch()} />;
  }

  const isIos =
    (user.device_type || '').toUpperCase() === 'IOS' ||
    (user.device_type || '').toUpperCase() === 'IPHONE' ||
    user.ios_waitlist;

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
        actions={
          <div className="flex items-center gap-2">
            {isIos && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotifyModalOpen(true)}
                className="border-primary/40"
              >
                <Apple className="mr-1.5 h-4 w-4 text-foreground" />
                <Bell className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {user.ios_notified_at ? 'Re-notify User' : 'Notify for iOS Launch'}
              </Button>
            )}
            <UserActions user={user} size="default" />
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
          <Badge variant={user.is_active ? 'success' : 'danger'}>
            {user.is_active ? 'Active' : 'Banned'}
          </Badge>
          {user.is_vip && <Badge variant="gold">VIP</Badge>}
          {user.crown_badge_unlocked && <Badge variant="warning">Crown unlocked</Badge>}
          <DeviceBadge
            deviceType={user.device_type}
            deviceModel={user.device_model}
            iosWaitlist={user.ios_waitlist}
            iosNotifiedAt={user.ios_notified_at}
          />
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

        <ProfileBadgeControls user={user} />

        {/* Device & Platform Details */}
        <SectionCard
          title="Device & Platform Details"
          description="Hardware and operating system data captured during registration / login."
          action={
            isIos ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setNotifyModalOpen(true)}
              >
                Send Notification
              </Button>
            ) : undefined
          }
        >
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="Device Type"
              value={
                <DeviceBadge
                  deviceType={user.device_type}
                  deviceModel={user.device_model}
                  iosWaitlist={user.ios_waitlist}
                  iosNotifiedAt={user.ios_notified_at}
                />
              }
            />
            <InfoRow label="Device Model" value={user.device_model || '—'} />
            <InfoRow label="OS Version" value={user.os_version || '—'} />
            <InfoRow label="Client App Version" value={user.app_version || '—'} />
            {isIos && (
              <>
                <InfoRow
                  label="iOS Support Status"
                  value={
                    user.ios_notified_at ? (
                      <span className="font-medium text-emerald-400">
                        Notified on {formatDateTime(user.ios_notified_at)}
                      </span>
                    ) : (
                      <span className="font-medium text-amber-400">
                        Waitlist (Pending iOS Launch)
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="Launch Notification"
                  value={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotifyModalOpen(true)}
                      className="h-7 text-xs"
                    >
                      <Bell className="mr-1 h-3.5 w-3.5 text-primary" />
                      {user.ios_notified_at ? 'Send Update Again' : 'Send Launch Alert'}
                    </Button>
                  }
                />
              </>
            )}
          </dl>
        </SectionCard>
      </div>

      <NotifyIosModal
        open={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        targetUser={{ id: user.id, name: user.name, email: user.email }}
      />
    </div>
  );
}

export { UserDetailPage };
