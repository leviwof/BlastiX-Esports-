import { Link } from 'react-router-dom';
import { CalendarClock, Coins, MapPin, Trophy, Users } from 'lucide-react';
import { GlowCard } from '@/components/shared/GlowCard';
import { TournamentStatusBadge } from './TournamentStatusBadge';
import { formatDateTime, formatEnum } from '../tournaments.utils';
import type { TournamentListItem } from '../tournaments.types';

export interface TournamentCardProps {
  tournament: TournamentListItem;
  /** Where the card links to (defaults to the tournament detail page). */
  to?: string;
}

/** Compact tournament tile used across the list, live and picker screens. */
function TournamentCard({ tournament: t, to }: TournamentCardProps) {
  const filled = t.max_slots > 0 ? Math.min(100, Math.round((t.registered_count / t.max_slots) * 100)) : 0;

  return (
    <Link to={to ?? `/tournaments/${t.id}`} className="group block focus-visible:outline-none">
      <GlowCard interactive className="flex h-full flex-col p-4.5 border-white/[0.08] hover:border-primary/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center rounded border border-white/10 bg-surface-2/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                {t.game_slug ? formatEnum(t.game_slug) : 'BATTLE ROYALE'}
              </span>
              <span className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                {formatEnum(t.team_mode)}
              </span>
            </div>
            <h3 className="truncate font-display text-base font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
              {t.title}
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
  );
}

export { TournamentCard };
