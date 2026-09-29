import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { KeyRound, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { TournamentStatusBadge } from '@/features/tournaments/components/TournamentStatusBadge';
import { StatusControl } from '@/features/tournaments/components/StatusControl';
import { RoomDialog } from '@/features/tournaments/components/RoomDialog';
import { ParticipantsPanel } from '@/features/tournaments/components/ParticipantsPanel';
import { MatchesPanel } from '@/features/tournaments/components/MatchesPanel';
import { LeaderboardPanel } from '@/features/tournaments/components/LeaderboardPanel';
import { useTournament } from '@/features/tournaments/tournaments.hooks';
import { formatDateTime, formatEnum } from '@/features/tournaments/tournaments.utils';
import type { Tournament } from '@/features/tournaments/tournaments.types';

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-foreground-muted">{label}</dt>
      <dd className="text-sm text-foreground-soft">{value}</dd>
    </div>
  );
}

function rulesList(rules: unknown): string[] {
  if (Array.isArray(rules)) return rules.filter((r): r is string => typeof r === 'string');
  return [];
}

/** /tournaments/:id — full detail + all admin controls for one tournament. */
function TournamentDetailPage() {
  const { id = '' } = useParams();
  const { data, isPending, isError, error, refetch } = useTournament(id);
  const [roomOpen, setRoomOpen] = useState(false);

  if (isPending) return <LoadingState label="Loading tournament…" />;
  if (isError) {
    return (
      <ErrorState title="Couldn't load tournament" error={error} onRetry={() => void refetch()} />
    );
  }

  const t: Tournament = data;
  const rules = rulesList(t.rules);

  return (
    <div>
      <PageHeader
        title={t.title}
        description={`${formatEnum(t.format)} · ${formatEnum(t.team_mode)} · ${t.map}`}
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Tournaments', to: '/tournaments' },
          { label: t.title },
        ]}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/tournaments/${t.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setRoomOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Set room
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <TournamentStatusBadge status={t.status} />
          <span className="text-sm text-foreground-muted">
            {t.registered_count} / {t.max_slots} slots filled · {t.slots_left} left
          </span>
        </div>

        <SectionCard title="Lifecycle" description="Change the tournament status or finalize standings.">
          <StatusControl tournament={t} />
        </SectionCard>

        <SectionCard title="Overview">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Format" value={formatEnum(t.format)} />
            <InfoRow label="Team mode" value={formatEnum(t.team_mode)} />
            <InfoRow label="Map" value={t.map} />
            <InfoRow label="Entry fee" value={t.entry_fee.toLocaleString()} />
            <InfoRow label="Prize pool" value={t.prize_pool.toLocaleString()} />
            <InfoRow label="Slots" value={`${t.registered_count} / ${t.max_slots}`} />
            <InfoRow label="Registration opens" value={formatDateTime(t.registration_opens_at)} />
            <InfoRow label="Registration closes" value={formatDateTime(t.registration_closes_at)} />
            <InfoRow label="Starts at" value={formatDateTime(t.starts_at)} />
          </dl>

          {t.description && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-foreground-muted">Description</p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground-soft">{t.description}</p>
            </div>
          )}

          {rules.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-foreground-muted">Rules</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-foreground-soft">
                {rules.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        <ParticipantsPanel tournamentId={t.id} />
        <MatchesPanel tournamentId={t.id} defaultMap={t.map} />
        <LeaderboardPanel tournamentId={t.id} />
      </div>

      <RoomDialog tournamentId={t.id} open={roomOpen} onClose={() => setRoomOpen(false)} />
    </div>
  );
}

export { TournamentDetailPage };
