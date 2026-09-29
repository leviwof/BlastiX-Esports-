import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AttentionItem {
  /** Short category tag, e.g. "PROOFS" or "STARTING". */
  tag: string;
  /** One-line description of what needs the admin. */
  message: string;
  /** Button label — says exactly what it does. */
  actionLabel: string;
  /** Where the action goes. */
  to: string;
}

export interface NeedsAttentionProps {
  items: AttentionItem[];
  loading?: boolean;
  className?: string;
}

/**
 * Top-of-dashboard triage panel: a dark-green card with a green left border and
 * one row per thing that needs the admin now. Rows are data-driven — when
 * nothing is outstanding it shows a calm "all caught up" state rather than
 * inventing work.
 */
function NeedsAttention({ items, loading, className }: NeedsAttentionProps) {
  return (
    <section
      className={cn(
        'relative rounded-xl border border-white/10 border-l-4 border-l-primary bg-[#101622]/90 backdrop-blur-md shadow-glow overflow-hidden',
        className,
      )}
      aria-label="Needs attention"
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-3.5 bg-surface/50">
        <AlertCircle className="h-4 w-4 text-primary drop-shadow-[0_0_6px_rgba(17,251,190,0.6)]" aria-hidden="true" />
        <h2 className="font-display text-base font-bold uppercase tracking-wider text-foreground">Needs Attention</h2>
      </div>

      {loading ? (
        <ul className="divide-y divide-border">
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-5 w-16 animate-pulse rounded-full bg-surface-elevated" />
              <div className="h-4 flex-1 animate-pulse rounded bg-surface-elevated/70" />
              <div className="h-8 w-24 animate-pulse rounded-[10px] bg-surface-elevated" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="px-5 py-5 text-sm text-foreground-muted">
          You&rsquo;re all caught up — nothing needs review right now.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, i) => (
            <li
              key={`${item.tag}-${i}`}
              className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-primary/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                {item.tag}
              </span>
              <p className="flex-1 text-sm text-foreground-soft">{item.message}</p>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to={item.to}>{item.actionLabel}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { NeedsAttention };
