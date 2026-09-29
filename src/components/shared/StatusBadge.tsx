import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus =
  | 'LIVE'
  | 'UPCOMING'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'COMPLETED'
  | 'DRAFT'
  | 'CANCELLED'
  | 'BANNED'
  | 'VERIFIED'
  | 'WINNER';

interface StatusConfig {
  label: string;
  className: string;
  dot: string;
  pulse?: boolean;
}

const STATUS: Record<BadgeStatus, StatusConfig> = {
  // Live → High-octane Free Fire combat badge with pulsing radar beacon
  LIVE: {
    label: 'LIVE',
    className: 'bg-danger/15 text-danger border-danger/40 shadow-glow-danger font-bold uppercase tracking-wider',
    dot: 'bg-danger',
    pulse: true,
  },
  // Upcoming → Electric mint outline pill
  UPCOMING: {
    label: 'UPCOMING',
    className: 'bg-primary/10 text-primary border-primary/40 uppercase tracking-wider font-semibold',
    dot: 'bg-primary',
  },
  REGISTRATION_OPEN: {
    label: 'OPEN',
    className: 'bg-primary/15 text-primary border-primary/30 uppercase tracking-wider font-semibold',
    dot: 'bg-primary',
  },
  REGISTRATION_CLOSED: {
    label: 'CLOSED',
    className: 'bg-surface-2/60 text-foreground-muted border-white/10 uppercase tracking-wider',
    dot: 'bg-foreground-muted',
  },
  // Completed → Muted slate medal
  COMPLETED: {
    label: 'COMPLETED',
    className: 'bg-surface-2/40 text-foreground-muted border-white/5 uppercase tracking-wider',
    dot: 'bg-foreground-muted',
  },
  DRAFT: {
    label: 'DRAFT',
    className: 'bg-surface-2/50 text-foreground-muted border-white/10 uppercase tracking-wider',
    dot: 'bg-foreground-muted',
  },
  CANCELLED: {
    label: 'CANCELLED',
    className: 'bg-danger/10 text-danger border-danger/30 uppercase tracking-wider',
    dot: 'bg-danger',
  },
  BANNED: {
    label: 'BANNED',
    className: 'bg-danger/15 text-danger border-danger/50 shadow-glow-danger uppercase tracking-wider font-bold',
    dot: 'bg-danger',
  },
  VERIFIED: {
    label: 'VERIFIED',
    className: 'bg-primary/15 text-primary border-primary/35 shadow-glow uppercase tracking-wider font-bold',
    dot: 'bg-primary',
  },
  WINNER: {
    label: 'WINNER',
    className: 'bg-gold/20 text-gold border-gold/40 shadow-glow-gold uppercase tracking-wider font-bold',
    dot: 'bg-gold',
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus;
  /** Override the default label text. */
  label?: string;
}

/** Themed status pill; LIVE gets an active radar ping. */
function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const cfg = STATUS[status] ?? STATUS.COMPLETED;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-[10px] font-display',
        cfg.className,
        className,
      )}
      {...props}
    >
      {cfg.pulse ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
        </span>
      ) : (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cfg.dot)} />
      )}
      <span>{label ?? cfg.label}</span>
    </span>
  );
}

export { StatusBadge };
