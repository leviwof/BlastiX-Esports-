import { useState } from 'react';
import { Plus, Swords } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMatches, useParticipants } from '../tournaments.hooks';
import { formatDateTime } from '../tournaments.utils';
import { CreateMatchDialog } from './CreateMatchDialog';
import { MatchResultsDialog } from './MatchResultsDialog';
import type { Match } from '../tournaments.types';

export interface MatchesPanelProps {
  tournamentId: string;
  /** Default map for the create-match form. */
  defaultMap?: string;
}

const MATCH_VARIANT: Record<string, 'default' | 'success' | 'secondary'> = {
  LIVE: 'default',
  COMPLETED: 'success',
  SCHEDULED: 'secondary',
};

/** Matches list with create-match and per-match result-recording actions. */
function MatchesPanel({ tournamentId, defaultMap }: MatchesPanelProps) {
  const { data, isPending, isError, error, refetch } = useMatches(tournamentId);
  // Shares the participants cache entry with ParticipantsPanel (same query key).
  const { data: participants = [] } = useParticipants(tournamentId);
  const [createOpen, setCreateOpen] = useState(false);
  const [resultsFor, setResultsFor] = useState<Match | null>(null);

  const nextMatchNumber = data && data.length > 0
    ? Math.max(...data.map((m) => m.match_number)) + 1
    : 1;

  return (
    <SectionCard
      title="Matches"
      description="Rounds within this tournament. Record placement + kills per match to build the leaderboard."
      contentClassName="p-0"
      action={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create match
        </Button>
      }
    >
      {isPending ? (
        <LoadingState label="Loading matches…" />
      ) : isError ? (
        <ErrorState title="Couldn't load matches" error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No matches yet"
          description="Create the first match to start recording results."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-foreground-muted">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Map</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
                <th className="px-5 py-3 font-medium">Results</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 text-foreground-soft">{m.match_number}</td>
                  <td className="px-5 py-3 text-foreground-muted">{m.map}</td>
                  <td className="px-5 py-3">
                    <Badge variant={MATCH_VARIANT[m.status] ?? 'secondary'}>{m.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-foreground-muted">{formatDateTime(m.scheduled_at)}</td>
                  <td className="px-5 py-3 text-foreground-muted">{m.results?.length ?? 0} recorded</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => setResultsFor(m)}>
                      Record results
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateMatchDialog
        tournamentId={tournamentId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultMap={defaultMap}
        nextMatchNumber={nextMatchNumber}
      />
      <MatchResultsDialog
        tournamentId={tournamentId}
        match={resultsFor}
        participants={participants}
        onClose={() => setResultsFor(null)}
      />
    </SectionCard>
  );
}

export { MatchesPanel };
