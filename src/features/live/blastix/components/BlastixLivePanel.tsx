import { Link } from 'react-router-dom';
import {
  Radio,
  Trophy,
  Swords,
  ShieldCheck,
  KeyRound,
  Plus,
  BarChart3,
} from 'lucide-react';
import { GlowCard } from '@/components/shared/GlowCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';
import { useTournaments } from '@/features/tournaments/tournaments.hooks';

export function BlastixLivePanel() {
  const { data } = useTournaments({ status: 'LIVE', limit: 50 });
  const liveCount = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* BlastiX Live Banner & KPI Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">BlastiX Internal Live Arena</span>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                BlastiX Platform Data
              </Badge>
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {liveCount} Live Now
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              Live tournaments, room credentials, and matches hosted directly on BlastiX. Powered exclusively by our internal database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link to="/matches">
              <Swords className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Matches Hub
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs">
            <Link to="/tournaments?status=UPCOMING">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Manage Tournaments
            </Link>
          </Button>
        </div>
      </div>

      {/* Admin Live Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard className="p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground-muted font-medium">Live Tournaments</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">{liveCount}</div>
            <div className="text-[11px] text-foreground-muted mt-0.5">Currently running in arena</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Trophy className="h-5 w-5" />
          </div>
        </GlowCard>

        <GlowCard className="p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground-muted font-medium">Room Credentials</div>
            <div className="text-sm font-semibold text-foreground mt-1">Live Custom Rooms</div>
            <div className="text-[11px] text-foreground-muted mt-0.5">Set Room ID & Passwords</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <KeyRound className="h-5 w-5" />
          </div>
        </GlowCard>

        <GlowCard className="p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground-muted font-medium">Match Results</div>
            <div className="text-sm font-semibold text-foreground mt-1">Points Calculation</div>
            <div className="text-[11px] text-foreground-muted mt-0.5">Record kills & placements</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </div>
        </GlowCard>

        <GlowCard className="p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground-muted font-medium">Fairplay Control</div>
            <div className="text-sm font-semibold text-foreground mt-1">Player Disqualify</div>
            <div className="text-[11px] text-foreground-muted mt-0.5">Instant ban & DQ enforcement</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </GlowCard>
      </div>

      {/* Internal Live Tournaments Browser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Active BlastiX Live Tournaments</h2>
            <p className="text-xs text-foreground-muted">
              Select any live tournament to open its room credentials modal, view registered participants, or enter match scores.
            </p>
          </div>
        </div>

        <TournamentBrowser
          lockedStatus="LIVE"
          emptyTitle="No BlastiX tournaments live right now"
          emptyDescription="Tournaments created on BlastiX appear here once their status is changed to LIVE. You can transition an upcoming tournament to Live from the Tournaments tab."
        />
      </div>
    </div>
  );
}
