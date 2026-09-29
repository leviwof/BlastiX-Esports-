import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Centered spinner for in-flight data (CSS-only, no icon dependency). */
function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden="true"
      />
      <p className="text-sm text-foreground-muted">{label}</p>
    </div>
  );
}

/** Rectangular pulse placeholder for skeleton layouts. */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-elevated', className)} />;
}

export { LoadingState, Skeleton };
