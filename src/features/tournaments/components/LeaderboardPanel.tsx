import { BarChart3 } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLeaderboard } from '../tournaments.hooks';

export interface LeaderboardPanelProps {
  tournamentId: string;
}

/** Read-only standings, derived by the backend from recorded match results. */
function LeaderboardPanel({ tournamentId }: LeaderboardPanelProps) {
  const { data, isPending, isError, error, refetch } = useLeaderboard(tournamentId);

  return (
    <SectionCard
      title="Leaderboard"
      description="Standings are computed by the backend from match results (record results to update them)."
      contentClassName="p-0"
    >
      {isPending ? (
        <LoadingState label="Loading leaderboard…" />
      ) : isError ? (
        <ErrorState title="Couldn't load leaderboard" error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No standings yet"
          description="The leaderboard populates once match results are recorded."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-foreground-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Participant</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-right font-medium">Placement</th>
                <th className="px-5 py-3 text-right font-medium">Kills pts</th>
                <th className="px-5 py-3 text-right font-medium">Kills</th>
                <th className="px-5 py-3 text-right font-medium">Booyahs</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.registration_id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-display font-semibold text-foreground">{row.rank}</td>
                  <td className="px-5 py-3 text-foreground-soft">
                    {row.participant_name}
                    {row.team_tag && (
                      <span className="ml-1 text-xs text-foreground-muted">[{row.team_tag}]</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">{row.total_points}</td>
                  <td className="px-5 py-3 text-right text-foreground-muted">{row.placement_points}</td>
                  <td className="px-5 py-3 text-right text-foreground-muted">{row.kill_points}</td>
                  <td className="px-5 py-3 text-right text-foreground-muted">{row.total_kills}</td>
                  <td className="px-5 py-3 text-right text-foreground-muted">{row.booyahs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export { LeaderboardPanel };
