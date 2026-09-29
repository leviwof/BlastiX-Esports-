import { Activity, Radio, Trophy, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { GlowCard } from '@/components/shared/GlowCard';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, type BadgeStatus } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/**
 * TEMPORARY design-system showcase (DS-1).
 * Static examples of the shared primitives so the theme can be reviewed in-app.
 * Contains NO real business data and NO backend calls — delete this file once
 * the real Dashboard screen is built (DS-2+).
 */

const SWATCHES: { name: string; className: string }[] = [
  { name: 'background', className: 'bg-background' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-elevated', className: 'bg-surface-elevated' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'primary-2', className: 'bg-primary-2' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'gold', className: 'bg-gold' },
];

const STATUSES: BadgeStatus[] = [
  'LIVE', 'UPCOMING', 'REGISTRATION_OPEN', 'COMPLETED', 'DRAFT', 'CANCELLED', 'BANNED', 'VERIFIED', 'WINNER',
];

function DashboardShowcasePage() {
  return (
    <div>
      <PageHeader
        title="Design System"
        description="Temporary showcase of BlastIX admin UI primitives — no live data. Replaced by the real Dashboard in DS-2."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Design System' }]}
      />

      <div className="space-y-6">
        {/* Colors */}
        <SectionCard title="Palette" description="Semantic color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SWATCHES.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className={`h-14 rounded-md border border-border ${s.className}`} />
                <p className="text-xs text-foreground-muted">{s.name}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Typography */}
        <SectionCard title="Typography" description="Chakra Petch display + Inter body">
          <div className="space-y-3">
            <p className="font-display text-3xl font-bold tracking-wide text-foreground">
              Chakra Petch — Blastix Admin
            </p>
            <p className="text-glow font-display text-xl font-semibold text-primary">Green glow heading</p>
            <p className="text-sm text-foreground-soft">
              Inter body text — the quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-xs text-foreground-muted">Muted caption text for secondary information.</p>
          </div>
        </SectionCard>

        {/* Buttons */}
        <SectionCard title="Buttons" description="Variants and sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </SectionCard>

        {/* Inputs + badges */}
        <SectionCard title="Inputs & Badges">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled input" disabled />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="gold">Gold</Badge>
            </div>
          </div>
        </SectionCard>

        {/* Status badges */}
        <SectionCard title="Status Badges" description="Tournament / entity states">
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </SectionCard>

        {/* Stat cards */}
        <SectionCard
          title="Stat Cards"
          description="KPI tiles — value, trend, sparkline, accent, loading and clickable states"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active tournaments" value={12} trend="4 starting today" icon={Trophy} />
            <StatCard title="Live now" value={3} accent icon={Radio} trend="2 finishing soon" />
            <StatCard
              title="Total players"
              value="8,420"
              icon={Users}
              sparkline={[4, 6, 5, 8, 7, 9, 12]}
              trend="Trend is illustrative"
            />
            <StatCard title="Syncing" loading icon={Activity} />
          </div>
        </SectionCard>

        {/* Cards */}
        <SectionCard title="Cards" description="GlowCard base surface">
          <div className="grid gap-4 md:grid-cols-2">
            <GlowCard className="p-5">
              <p className="font-display text-lg font-semibold text-foreground">GlowCard</p>
              <p className="mt-1 text-sm text-foreground-muted">Dark-green panel with a thin green border.</p>
            </GlowCard>
            <GlowCard interactive glow className="p-5">
              <p className="font-display text-lg font-semibold text-foreground">Interactive GlowCard</p>
              <p className="mt-1 text-sm text-foreground-muted">Hover for lift + brighter glow.</p>
            </GlowCard>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export { DashboardShowcasePage };
