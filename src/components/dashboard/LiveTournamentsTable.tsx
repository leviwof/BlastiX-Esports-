import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { TournamentStatusBadge } from '@/features/tournaments/components/TournamentStatusBadge';
import { formatEnum } from '@/lib/format';
import type { TournamentListItem } from '@/features/tournaments/tournaments.types';

export interface LiveTournamentsTableProps {
  items: TournamentListItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

/** Live tournaments overview table (Dashboard). Scrolls horizontally on small screens. */
function LiveTournamentsTable({ items, loading, error, onRetry }: LiveTournamentsTableProps) {
  return (
    <SectionCard
      title="Live tournaments"
      description="Tournaments currently in progress."
      contentClassName="p-0"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/live">Open Live Arena</Link>
        </Button>
      }
    >
      {loading ? (
        <LoadingState label="Loading live tournaments…" />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Could not load data</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No live tournaments right now"
          description="Live tournaments will appear here while they run."
          action={
            <Button asChild size="sm">
              <Link to="/tournaments/new">Create tournament</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-surface/30 text-left text-[11px] font-display font-semibold uppercase tracking-wider text-foreground-muted">
                <th className="px-5 py-3">Tournament</th>
                <th className="px-5 py-3">Game</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Squad Progress</th>
                <th className="px-5 py-3">Players</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {items.map((t) => {
                const pct =
                  t.max_slots > 0
                    ? Math.min(100, Math.round((t.registered_count / t.max_slots) * 100))
                    : 0;
                return (
                  <tr key={t.id} className="transition-colors hover:bg-primary/[0.03]">
                    <td className="max-w-[240px] px-5 py-3.5">
                      <Link
                        to={`/tournaments/${t.id}`}
                        className="block truncate font-display font-semibold uppercase tracking-wide text-foreground-soft hover:text-primary transition-colors"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted font-display text-xs">{formatEnum(t.game_slug ?? '—')}</td>
                    <td className="px-5 py-3.5">
                      <TournamentStatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex w-40 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-[#00f5a0] shadow-glow"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-display text-primary font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted font-display">
                      {t.registered_count} <span className="text-foreground-muted/60">/ {t.max_slots}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/tournaments/${t.id}`}>Manage</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export { LiveTournamentsTable };
