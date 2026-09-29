import {
  CalendarClock,
  Radio,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
  Users2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { NeedsAttention, type AttentionItem } from '@/components/dashboard/NeedsAttention';
import { LiveTournamentsTable } from '@/components/dashboard/LiveTournamentsTable';
import { useStats } from '@/features/stats/stats.hooks';
import { useTournaments } from '@/features/tournaments/tournaments.hooks';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Admin dashboard. KPI tiles read the aggregate `GET /admin/stats` endpoint;
 * the live table and "starting soon" attention rows read the tournaments list.
 * Every surface is data-driven — nothing invents a number, and a failed stats
 * fetch shows a retry panel rather than a row of dashes.
 */
function DashboardPage() {
  const stats = useStats();
  const live = useTournaments({ status: 'LIVE', limit: 100 });
  const upcoming = useTournaments({ status: 'UPCOMING', limit: 100 });

  const s = stats.data;

  // Data-driven triage rows: real pending proofs + tournaments starting soon.
  const attention: AttentionItem[] = [];
  if (s?.proofs.pending) {
    attention.push({
      tag: 'PROOFS',
      message: `${s.proofs.pending} proof${s.proofs.pending === 1 ? '' : 's'} awaiting review.`,
      actionLabel: 'Review proofs',
      to: '/proofs',
    });
  }
  const startingSoon = (upcoming.data?.items ?? []).filter((t) => {
    const delta = +new Date(t.starts_at) - Date.now();
    return delta > 0 && delta <= DAY_MS;
  });
  if (startingSoon.length > 0) {
    attention.push({
      tag: 'STARTING',
      message: `${startingSoon.length} tournament${startingSoon.length === 1 ? '' : 's'} starting within 24 hours.`,
      actionLabel: 'View upcoming',
      to: '/tournaments',
    });
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="What needs you today, and what is running now."
      />

      <div className="space-y-6">
        <NeedsAttention items={attention} loading={stats.isPending || upcoming.isPending} />
        {stats.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface/80 py-12 text-center">
            <p className="font-display text-lg font-semibold text-foreground">Could not load data</p>
            <p className="text-sm text-foreground-muted">The dashboard stats didn’t load.</p>
            <Button variant="outline" size="sm" onClick={() => void stats.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total users"
              value={s?.users.total ?? 0}
              loading={stats.isPending}
              icon={Users}
              to="/users"
              trend={s ? `${s.users.active} active · ${s.users.admins} admins` : undefined}
            />
            <StatCard
              title="Teams"
              value={s?.teams.total ?? 0}
              loading={stats.isPending}
              icon={Users2}
              to="/teams"
              trend="Registered teams."
            />
            <StatCard
              title="Live now"
              value={s?.tournaments.live ?? 0}
              loading={stats.isPending}
              icon={Radio}
              to="/live"
              accent
              trend="In progress now."
            />
            <StatCard
              title="Upcoming"
              value={s?.tournaments.upcoming ?? 0}
              loading={stats.isPending}
              icon={CalendarClock}
              to="/tournaments"
              trend="Scheduled ahead."
            />
            <StatCard
              title="Pending proofs"
              value={s?.proofs.pending ?? 0}
              loading={stats.isPending}
              icon={ShieldCheck}
              to="/proofs"
              accent
              trend="Awaiting review."
            />
            <StatCard
              title="Active challenges"
              value={s?.challenges.active ?? 0}
              loading={stats.isPending}
              icon={Target}
              to="/challenges"
              trend="Currently running."
            />
          </div>
        )}
        <LiveTournamentsTable
          items={live.data?.items ?? []}
          loading={live.isPending}
          error={live.isError}
          onRetry={() => void live.refetch()}
        />
      </div>
    </div>
  );
}

export { DashboardPage };
