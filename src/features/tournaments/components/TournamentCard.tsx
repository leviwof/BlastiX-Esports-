import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Coins,
  MapPin,
  Trophy,
  Users,
  Flame,
  Zap,
  Pencil,
  Trash2,
  Users2,
} from 'lucide-react';
import { GlowCard } from '@/components/shared/GlowCard';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TournamentStatusBadge } from './TournamentStatusBadge';
import { formatDateTime, formatEnum } from '../tournaments.utils';
import { getTournamentSection, cleanTournamentTitle } from '../tournament.section';
import { useUpdateTournamentStatus } from '../tournaments.hooks';
import type { TournamentListItem } from '../tournaments.types';

export interface TournamentCardProps {
  tournament: TournamentListItem;
  /** Where the card links to (defaults to the tournament detail page). */
  to?: string;
  /** If true, renders explicit quick management action buttons (edit, players, cancel). */
  showActions?: boolean;
}

/** Compact tournament tile used across the list, live and picker screens. */
function TournamentCard({ tournament: t, to, showActions = false }: TournamentCardProps) {
  const navigate = useNavigate();
  const filled = t.max_slots > 0 ? Math.min(100, Math.round((t.registered_count / t.max_slots) * 100)) : 0;
  const section = getTournamentSection(t);
  const displayTitle = cleanTournamentTitle(t.title);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const updateStatus = useUpdateTournamentStatus(t.id);

  const handleCancelTournament = () => {
    updateStatus.mutate(
      { status: 'CANCELLED' },
      { onSuccess: () => setConfirmCancel(false) },
    );
  };

  const isCancelled = t.status === 'CANCELLED';

  return (
    <>
      <div className="group flex h-full flex-col">
        <Link to={to ?? `/tournaments/${t.id}`} className="block flex-1 focus-visible:outline-none">
          <GlowCard interactive className="flex h-full flex-col p-4.5 border-white/[0.08] hover:border-primary/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {/* Dedicated Section Indicator */}
                  {section === 'freefire' ? (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      <Flame className="h-2.5 w-2.5 text-amber-400" />
                      Free Fire Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      <Zap className="h-2.5 w-2.5 text-primary" />
                      BlastX E-Sports
                    </span>
                  )}

                  <span className="inline-flex items-center rounded border border-white/10 bg-surface-2/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                    {t.game_slug ? formatEnum(t.game_slug) : 'BATTLE ROYALE'}
                  </span>
                  <span className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    {formatEnum(t.team_mode)}
                  </span>
                </div>
                <h3 className="truncate font-display text-base font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
                  {displayTitle}
                </h3>
              </div>
              <TournamentStatusBadge status={t.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-foreground-muted">
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                {formatEnum(t.format)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                {formatEnum(t.team_mode)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                {t.map}
              </span>
            </div>

            {/* Slots progress bar with electric mint glow */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display uppercase tracking-wider text-[10px] text-foreground-muted">Squad Slots</span>
                <span className="font-medium text-foreground-soft font-display">
                  {t.registered_count} <span className="text-foreground-muted">/ {t.max_slots}</span>
                  <span className="ml-1 text-[11px] text-primary font-semibold">({t.slots_left} left)</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[#00f5a0] shadow-glow transition-all duration-300"
                  style={{ width: `${filled}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs text-foreground-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-foreground-muted" aria-hidden="true" />
                <span>{formatDateTime(t.starts_at)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-gold drop-shadow-[0_0_8px_rgba(255,186,0,0.45)]">
                <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
                <span>{t.prize_pool.toLocaleString()} COINS</span>
              </span>
            </div>
          </GlowCard>
        </Link>

        {/* Quick management actions when showActions is enabled */}
        {showActions && (
          <div className="mt-2 flex items-center gap-2 px-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => navigate(`/tournaments/${t.id}/edit`)}
            >
              <Pencil className="h-3 w-3 mr-1 text-primary" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => navigate(`/tournaments/${t.id}`)}
            >
              <Users2 className="h-3 w-3 mr-1 text-primary" />
              Players
            </Button>
            {!isCancelled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2.5 text-red-400 hover:text-red-300 hover:border-red-500/40"
                onClick={() => setConfirmCancel(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel tournament"
        description={`Are you sure you want to cancel "${displayTitle}"? It will be marked as Cancelled and removed from active app lobbies.`}
        confirmLabel="Cancel tournament"
        cancelLabel="Keep tournament"
        destructive
        loading={updateStatus.isPending}
        onConfirm={handleCancelTournament}
        onClose={() => setConfirmCancel(false)}
      />
    </>
  );
}

export { TournamentCard };
