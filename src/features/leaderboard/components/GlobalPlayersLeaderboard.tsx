import { useState } from 'react';
import {
  Trophy,
  Swords,
  Search,
  Crown,
  Sparkles,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalLeaderboard } from '../hooks/useGlobalLeaderboard';
import type { GlobalLeaderboardQuery, GlobalPlayerLeaderboardEntry } from '../types/leaderboard.types';

export function GlobalPlayersLeaderboard() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<GlobalLeaderboardQuery['sortBy']>('points');
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading, isError, error, refetch } = useGlobalLeaderboard({
    page,
    limit,
    q: debouncedSearch,
    sortBy,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    // Simple debouncer
    const timer = setTimeout(() => {
      setDebouncedSearch(e.target.value.trim());
    }, 400);
    return () => clearTimeout(timer);
  };

  const handleSortChange = (newSort: GlobalLeaderboardQuery['sortBy']) => {
    setSortBy(newSort);
    setPage(1);
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Top 3 Podium
  const top1 = page === 1 ? items[0] : null;
  const top2 = page === 1 ? items[1] : null;
  const top3 = page === 1 ? items[2] : null;

  return (
    <div className="space-y-6">
      {/* Search & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B0E14] p-4 shadow-xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by name, IGN, or UID..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-white/10 bg-black/60 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-[#11FBBE] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted mr-1">Sort by:</span>
          {(
            [
              { key: 'points', label: 'Points', icon: Sparkles },
              { key: 'kills', label: 'Kills', icon: Swords },
              { key: 'tournamentsWon', label: 'Wins', icon: Trophy },
              { key: 'xp', label: 'XP', icon: TrendingUp },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSortChange(opt.key)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                sortBy === opt.key
                  ? 'border-[#11FBBE]/50 bg-[#11FBBE]/10 text-[#11FBBE] shadow-[0_0_12px_rgba(17,251,190,0.15)]'
                  : 'border-white/10 bg-white/[0.02] text-foreground-muted hover:border-white/20 hover:text-foreground'
              }`}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards (on page 1 when no search active) */}
      {page === 1 && !debouncedSearch && items.length >= 3 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {/* #2 Silver */}
          {top2 && <PodiumCard player={top2} place={2} />}
          {/* #1 Gold */}
          {top1 && <PodiumCard player={top1} place={1} />}
          {/* #3 Bronze */}
          {top3 && <PodiumCard player={top3} place={3} />}
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="rounded-xl border border-white/10 bg-[#0B0E14] overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#11FBBE]" />
            <h3 className="font-display text-sm font-bold tracking-wide text-foreground">
              Global Player Standings
            </h3>
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-foreground-muted">
              {total} Total Players
            </span>
          </div>

          <div className="text-xs text-foreground-muted font-mono">
            Page {page} of {totalPages}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            Loading player rankings...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-red-400">
            Error loading leaderboard: {(error as any)?.message || 'Request failed'}.
            <Button size="sm" variant="outline" onClick={() => void refetch()} className="ml-2">
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No players found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-foreground-muted">
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Free Fire In-Game UID / IGN</th>
                  <th className="py-3 px-4 text-center">Tournaments</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">Kills</th>
                  <th className="py-3 px-4 text-right">Points / XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((player) => (
                  <tr
                    key={player.userId}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      player.rank <= 3 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <RankBadge rank={player.rank} />
                    </td>

                    {/* Player Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground overflow-hidden shrink-0">
                          {player.profilePic ? (
                            <img
                              src={player.profilePic}
                              alt={player.userName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-4 w-4 text-foreground-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {player.userName}
                          </div>
                          <div className="text-[11px] text-foreground-muted truncate">
                            {player.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* In Game Identity */}
                    <td className="py-3 px-4">
                      {player.inGameUid ? (
                        <div className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/40 px-2 py-1 text-[11px]">
                          <Gamepad2 className="h-3 w-3 text-[#11FBBE]" />
                          <span className="font-semibold text-foreground">
                            {player.inGameName || 'Player'}
                          </span>
                          <span className="font-mono text-foreground-muted text-[10px]">
                            ({player.inGameUid})
                          </span>
                        </div>
                      ) : (
                        <span className="text-foreground-muted/50 italic text-[11px]">
                          Profile not linked
                        </span>
                      )}
                    </td>

                    {/* Tournaments Played / Won */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-foreground font-medium">
                        {player.tournamentsPlayed}
                      </span>
                      {player.tournamentsWon > 0 && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400">
                          <Trophy className="h-2.5 w-2.5" />
                          {player.tournamentsWon}
                        </span>
                      )}
                    </td>

                    {/* Win Rate */}
                    <td className="py-3 px-4 text-center font-mono text-foreground-muted">
                      {player.winRate}
                    </td>

                    {/* Kills */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-semibold text-red-400">
                        <Swords className="h-3 w-3 text-red-400/80" />
                        {player.totalKills}
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-sm text-[#11FBBE]">
                        {player.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-foreground-muted">
                        {player.xp.toLocaleString()} XP
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.01] p-3 text-xs">
            <span className="text-foreground-muted">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} players
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 text-xs border-white/10"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Previous
              </Button>
              <span className="font-mono font-semibold px-2 text-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-7 text-xs border-white/10"
              >
                Next
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300/20 text-slate-200 font-bold border border-slate-300/40 shadow-[0_0_8px_rgba(203,213,225,0.2)]">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-500 font-bold border border-amber-600/40">
        3
      </span>
    );
  }
  return <span className="font-mono text-foreground-muted font-medium">#{rank}</span>;
}

function PodiumCard({
  player,
  place,
}: {
  player: GlobalPlayerLeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const isFirst = place === 1;
  const isSecond = place === 2;

  const borderStyles = isFirst
    ? 'border-amber-400/50 bg-gradient-to-b from-amber-400/10 via-black/40 to-black/60 shadow-[0_0_25px_rgba(251,191,36,0.15)] order-1 sm:order-2'
    : isSecond
    ? 'border-slate-300/40 bg-gradient-to-b from-slate-300/10 via-black/40 to-black/60 shadow-[0_0_15px_rgba(203,213,225,0.1)] order-2 sm:order-1'
    : 'border-amber-600/40 bg-gradient-to-b from-amber-700/10 via-black/40 to-black/60 shadow-[0_0_15px_rgba(180,83,9,0.1)] order-3';

  return (
    <div className={`relative flex flex-col items-center rounded-xl border p-4 text-center ${borderStyles}`}>
      <div className="absolute top-2.5 right-3 font-mono text-xs font-bold opacity-60">
        #{place}
      </div>

      <div className="relative mb-2 mt-1">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 overflow-hidden ${
            isFirst
              ? 'border-amber-400 shadow-[0_0_15px_#fbbf24]'
              : isSecond
              ? 'border-slate-300'
              : 'border-amber-600'
          }`}
        >
          {player.profilePic ? (
            <img src={player.profilePic} alt={player.userName} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-7 w-7 text-foreground-muted" />
          )}
        </div>
        {isFirst && (
          <Crown className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_#fbbf24]" />
        )}
      </div>

      <div className="font-display font-bold text-sm text-foreground truncate max-w-[160px]">
        {player.userName}
      </div>
      {player.inGameName && (
        <div className="text-[11px] text-[#11FBBE] font-mono mt-0.5">
          {player.inGameName}
        </div>
      )}

      <div className="mt-3 flex w-full items-center justify-around border-t border-white/10 pt-2 text-xs">
        <div>
          <span className="block text-[10px] text-foreground-muted uppercase">Points</span>
          <span className="font-mono font-bold text-[#11FBBE]">
            {player.totalPoints.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-foreground-muted uppercase">Kills</span>
          <span className="font-mono font-bold text-red-400">
            {player.totalKills}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-foreground-muted uppercase">Wins</span>
          <span className="font-mono font-bold text-amber-400">
            {player.tournamentsWon}
          </span>
        </div>
      </div>
    </div>
  );
}
