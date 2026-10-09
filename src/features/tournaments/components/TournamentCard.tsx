import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Coins,
  Image as ImageIcon,
  MapPin,
  Trophy,
  Users,
  Flame,
  Zap,
  Pencil,
  Trash2,
  Users2,
  KeyRound,
  Send,
} from 'lucide-react';
import { GlowCard } from '@/components/shared/GlowCard';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDateTime, formatEnum } from '../tournaments.utils';
import { getTournamentSection, cleanTournamentTitle } from '../tournament.section';
import { useSetRoomCredentials, useUpdateTournamentStatus } from '../tournaments.hooks';
import type { TournamentListItem } from '../tournaments.types';
import { Input } from '@/components/ui/input';

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
  const statusTone =
    t.status === 'LIVE'
      ? 'border-red-400/40 bg-red-500/15 text-red-200'
      : t.status === 'COMPLETED'
        ? 'border-white/15 bg-black/40 text-white/90'
        : section === 'freefire'
          ? 'border-amber-400/40 bg-black/45 text-amber-100'
          : 'border-primary/40 bg-black/45 text-white';

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [roomId, setRoomId] = useState(t.room_id ?? '');
  const [roomPassword, setRoomPassword] = useState(t.room_password ?? '');
  const updateStatus = useUpdateTournamentStatus(t.id);
  const setRoom = useSetRoomCredentials(t.id);

  useEffect(() => {
    setRoomId(t.room_id ?? '');
    setRoomPassword(t.room_password ?? '');
  }, [t.room_id, t.room_password]);

  const handleCancelTournament = () => {
    updateStatus.mutate(
      { status: 'CANCELLED' },
      { onSuccess: () => setConfirmCancel(false) },
    );
  };

  const isCancelled = t.status === 'CANCELLED';
  const roomIsPublished = Boolean(t.room_id && t.room_password && t.room_released_at);

  const handlePublishRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId.trim() || !roomPassword.trim()) return;
    setRoom.mutate({
      room_id: roomId.trim(),
      room_password: roomPassword.trim(),
      release_now: true,
    });
  };

  return (
    <>
      <div className="group flex h-full flex-col">
        <Link to={to ?? `/tournaments/${t.id}`} className="block flex-1 focus-visible:outline-none">
          <GlowCard interactive className="flex h-full flex-col border-white/[0.08] p-0 hover:border-primary/50">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-surface to-amber-500/10 sm:h-44">
              {t.banner_url ? (
                <img
                  src={t.banner_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary/50">
                  <ImageIcon className="h-10 w-10" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-[#101622]/15 to-black/10" />
              <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                    section === 'freefire'
                      ? 'border-amber-400/35 bg-black/45 text-amber-200'
                      : 'border-primary/35 bg-black/45 text-primary'
                  }`}
                >
                  {section === 'freefire' ? (
                    <Flame className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Zap className="h-3 w-3" aria-hidden="true" />
                  )}
                  {section === 'freefire' ? 'Free Fire Live' : 'BLASTiX E-Sports'}
                </span>
                {t.status !== 'REGISTRATION_OPEN' && t.status !== 'REGISTRATION_CLOSED' && (
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${statusTone}`}>
                    {formatEnum(t.status)}
                  </span>
                )}
              </div>
              <div className="absolute inset-x-4 bottom-4">
                <span className="mb-1.5 inline-flex rounded-md border border-white/15 bg-black/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
                  {t.game_slug ? formatEnum(t.game_slug) : 'BATTLE ROYALE'}
                </span>
                <h3 className="line-clamp-2 font-display text-lg font-bold uppercase leading-tight tracking-wide text-white drop-shadow group-hover:text-primary transition-colors">
                  {displayTitle}
                </h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2 text-foreground-muted">
                  <Trophy className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
                  <span className="truncate">{formatEnum(t.format)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2 text-foreground-muted">
                  <Users className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
                  <span className="truncate">{formatEnum(t.team_mode)}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2 text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
                  <span className="truncate">{t.map}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                    Registered slots
                  </span>
                  <span className="font-display font-semibold text-foreground-soft">
                    {t.registered_count}/{t.max_slots}
                    <span className="ml-1.5 text-[10px] font-medium text-primary">{t.slots_left} left</span>
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-label="Registered tournament slots"
                  aria-valuemin={0}
                  aria-valuemax={t.max_slots}
                  aria-valuenow={t.registered_count}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[#00f5a0] shadow-glow transition-all duration-300"
                    style={{ width: `${filled}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-3 mt-4">
                <div className="min-w-0">
                  <span className="block font-display text-[9px] font-semibold uppercase tracking-wider text-foreground-muted">
                    Starts
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-foreground-soft">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
                    {formatDateTime(t.starts_at)}
                  </span>
                </div>
                <div className="min-w-0 text-right">
                  <span className="block font-display text-[9px] font-semibold uppercase tracking-wider text-foreground-muted">
                    Prize pool
                  </span>
                  <span className="mt-1 inline-flex max-w-full items-center justify-end gap-1.5 truncate font-display text-xs font-bold text-gold">
                    <Coins className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                    {t.prize_pool.toLocaleString()} COINS
                  </span>
                </div>
              </div>
            </div>
          </GlowCard>
        </Link>

        {/* Quick management actions when showActions is enabled */}
        {showActions && (
          <>
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

            <form
              className="mt-3 space-y-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-3"
              onSubmit={handlePublishRoom}
              aria-label={`Room details for ${displayTitle}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground-soft">
                    Free Fire room
                  </h4>
                </div>
                {roomIsPublished && (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    Published
                  </span>
                )}
              </div>
              <Input
                aria-label={`Room ID for ${displayTitle}`}
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                placeholder="Paste Room ID"
                autoComplete="off"
                required
              />
              <Input
                aria-label={`Room password for ${displayTitle}`}
                value={roomPassword}
                onChange={(event) => setRoomPassword(event.target.value)}
                placeholder="Paste Room Password"
                autoComplete="off"
                required
              />
              <p className="text-[11px] leading-relaxed text-foreground-muted">
                Publish sends these details to confirmed players immediately. Players enter them in Free Fire MAX.
              </p>
              <Button type="submit" size="sm" className="w-full" disabled={setRoom.isPending}>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                {setRoom.isPending ? 'Publishing…' : roomIsPublished ? 'Update & publish room' : 'Publish room to players'}
              </Button>
            </form>
          </>
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
