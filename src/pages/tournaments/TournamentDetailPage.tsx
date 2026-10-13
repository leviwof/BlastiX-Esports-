import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { TournamentStatusBadge } from '@/features/tournaments/components/TournamentStatusBadge';
import { StatusControl } from '@/features/tournaments/components/StatusControl';
import { RoomDialog } from '@/features/tournaments/components/RoomDialog';
import { ParticipantsPanel } from '@/features/tournaments/components/ParticipantsPanel';
import { MatchesPanel } from '@/features/tournaments/components/MatchesPanel';
import { LeaderboardPanel } from '@/features/tournaments/components/LeaderboardPanel';
import { TournamentStageControlHub } from '@/features/tournaments/brackets/components/TournamentStageControlHub';
import { useDeleteTournament, useTournament } from '@/features/tournaments/tournaments.hooks';
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
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useTournament(id);
  const deleteTournament = useDeleteTournament();
  const [roomOpen, setRoomOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
            {t.status === 'CANCELLED' && (
              <Button
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                Delete
              </Button>
            )}
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

        {/* Tournament Bracket & Stage Progression Engine */}
        <SectionCard
          title="Stage Control Hub"
          description="Multi-round progression engine: monitor groups, enter match scores, resolve tie-breakers, manage wild card slots, and assemble the grand final."
        >
          <TournamentStageControlHub tournamentId={t.id} />
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

      <ConfirmDialog
        open={deleteOpen}
        title="Delete tournament permanently"
        description={`Are you sure you want to permanently delete "${t.title}"? This will remove this cancelled tournament and all its data from the database. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        cancelLabel="Keep tournament"
        destructive
        loading={deleteTournament.isPending}
        onConfirm={() => {
          deleteTournament.mutate(t.id, {
            onSuccess: () => navigate('/tournaments'),
          });
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export { TournamentDetailPage };
