import { cn } from '@/lib/utils';

export interface SparklineProps {
  /** Series to plot, oldest → newest. */
  values: number[];
  className?: string;
}

/**
 * Tiny inline bar sparkline (green). Purely decorative trend hint — it never
 * shows numbers, so it degrades gracefully when the series is short or flat.
 */
function Sparkline({ values, className }: SparklineProps) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div
      className={cn('flex h-8 items-end gap-[3px]', className)}
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const h = Math.max(12, Math.round((v / max) * 100));
        const lead = i === values.length - 1;
        return (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full',
              lead ? 'bg-primary' : 'bg-primary/40',
            )}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

export { Sparkline };
