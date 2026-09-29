import { useState } from 'react';
import { Users2 } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParticipants } from '../tournaments.hooks';
import { DisqualifyDialog } from './DisqualifyDialog';
import type { TournamentRegistration } from '../tournaments.types';

export interface ParticipantsPanelProps {
  tournamentId: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'secondary'> = {
  CONFIRMED: 'success',
  DISQUALIFIED: 'danger',
  CANCELLED: 'secondary',
};

const displayName = (p: TournamentRegistration): string =>
  p.user?.name ?? p.team?.name ?? `Slot ${p.slot_number}`;

/** Registrations table with per-row disqualify action (the only admin write here). */
function ParticipantsPanel({ tournamentId }: ParticipantsPanelProps) {
  const { data, isPending, isError, error, refetch } = useParticipants(tournamentId);
  const [target, setTarget] = useState<TournamentRegistration | null>(null);

  return (
    <SectionCard
      title="Participants"
      description="Registered players / teams. Disqualifying removes a registration from the standings."
      contentClassName="p-0"
    >
      {isPending ? (
        <LoadingState label="Loading participants…" />
      ) : isError ? (
        <ErrorState title="Couldn't load participants" error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState icon={Users2} title="No participants yet" description="Registrations will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-foreground-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Slot</th>
                <th className="px-5 py-3 font-medium">Participant</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Final rank</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 text-foreground-muted">{p.slot_number}</td>
                  <td className="px-5 py-3 text-foreground-soft">{displayName(p)}</td>
                  <td className="px-5 py-3 text-foreground-muted">
                    {p.team ? `${p.team.name}${p.team.tag ? ` [${p.team.tag}]` : ''}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-foreground-muted">{p.final_rank ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    {p.status === 'CONFIRMED' && (
                      <Button variant="destructive" size="sm" onClick={() => setTarget(p)}>
                        Disqualify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DisqualifyDialog
        tournamentId={tournamentId}
        registration={target}
        onClose={() => setTarget(null)}
      />
    </SectionCard>
  );
}

export { ParticipantsPanel };
