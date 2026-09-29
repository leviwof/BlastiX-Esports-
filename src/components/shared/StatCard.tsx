import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowCard } from './GlowCard';
import { Sparkline } from './Sparkline';

export interface StatCardProps {
  title: string;
  value?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Small trend line under the number, e.g. "312 active". */
  trend?: React.ReactNode;
  /** Optional mini bar sparkline (oldest → newest). */
  sparkline?: number[];
  /** Render the number in green to flag an action-worthy KPI. */
  accent?: boolean;
  /** Whole card links here and gets a hover lift + arrow affordance. */
  to?: string;
  /** Skeleton state while data loads. */
  loading?: boolean;
  className?: string;
}

/** KPI tile. Never hardcodes business values — value/trend are passed in. */
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  sparkline,
  accent,
  to,
  loading,
  className,
}: StatCardProps) {
  const body = (
    <GlowCard
      interactive={Boolean(to)}
      className={cn('relative h-full p-5', to && 'group cursor-pointer', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-foreground-muted">{title}</p>
        {Icon && (
          <span
            aria-hidden="true"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200',
              accent
                ? 'border-primary/40 bg-primary/15 text-primary shadow-[0_0_14px_rgba(17,251,190,0.25)] group-hover:border-primary group-hover:scale-110'
                : 'border-white/10 bg-surface-2/80 text-foreground-muted group-hover:border-primary/40 group-hover:text-primary group-hover:scale-105',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="h-8 w-24 animate-pulse rounded bg-surface-elevated" />
          <div className="h-3 w-32 animate-pulse rounded bg-surface-elevated/70" />
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p
              className={cn(
                'font-display text-3xl font-extrabold tracking-tight',
                accent ? 'text-primary text-glow' : 'text-foreground',
              )}
            >
              {value}
            </p>
            {sparkline && sparkline.length > 0 && (
              <Sparkline values={sparkline} className="mb-0.5" />
            )}
          </div>
          {trend && <p className="mt-2 text-xs font-medium text-foreground-muted/90">{trend}</p>}
          {description && !trend && (
            <p className="mt-2 text-xs text-foreground-muted">{description}</p>
          )}
        </>
      )}

      {to && (
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-4 bottom-4 h-4 w-4 text-primary opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </GlowCard>
  );

  if (to) {
    return (
      <Link to={to} className="relative block rounded-lg" aria-label={title}>
        {body}
      </Link>
    );
  }
  return <div className="relative">{body}</div>;
}

export { StatCard };
