import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Users2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { RosterTable } from '@/features/teams/components/RosterTable';
import { useTeam } from '@/features/teams/teams.hooks';
import { formatDateTime, formatEnum } from '@/lib/format';
import { getInitials } from '@/lib/utils';

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="text-sm text-foreground-soft">{value}</dd>
    </div>
  );
}

/** Team detail — header, metadata and the full roster (read-only). */
function TeamDetailPage() {
  const { id = '' } = useParams();
  const { data: team, isPending, isError, error, refetch } = useTeam(id);

  if (isPending) return <LoadingState label="Loading team…" />;
  if (isError) {
    return <ErrorState title="Couldn't load team" error={error} onRetry={() => void refetch()} />;
  }

  const memberCount = team.members.length;

  return (
    <div>
      <PageHeader
        title={team.name}
        description={`[${team.tag}]`}
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Teams', to: '/teams' },
          { label: team.name },
        ]}
      />

      <div className="space-y-6">
        <SectionCard title="Team">
          <div className="mb-6 flex items-center gap-4">
            {team.logo_url ? (
              <img
                src={team.logo_url}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-xl text-primary">
                {getInitials(team.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{team.name}</p>
              <p className="truncate text-sm text-foreground-muted">[{team.tag}]</p>
            </div>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Game" value={formatEnum(team.game_slug)} />
            <InfoRow label="Captain" value={team.captain?.name ?? '—'} />
            <InfoRow label="Members" value={memberCount} />
            <InfoRow
              label="Accepting subs"
              value={
                <Badge variant={team.accepting_substitutes ? 'success' : 'secondary'}>
                  {team.accepting_substitutes ? 'Open' : 'Closed'}
                </Badge>
              }
            />
            <InfoRow label="Team ID" value={<span className="font-mono text-xs">{team.id}</span>} />
            <InfoRow label="Created" value={formatDateTime(team.created_at)} />
          </dl>
        </SectionCard>

        <SectionCard
          title="Roster"
          description={`${memberCount} member${memberCount === 1 ? '' : 's'}`}
          contentClassName="p-0"
        >
          {memberCount === 0 ? (
            <EmptyState icon={Users2} title="No members" description="This team has no members yet." />
          ) : (
            <RosterTable members={team.members} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export { TeamDetailPage };
