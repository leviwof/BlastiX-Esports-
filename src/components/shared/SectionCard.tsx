import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlowCard } from './GlowCard';

export interface SectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned header slot (buttons, filters…). */
  action?: React.ReactNode;
  /** Extra classes for the content wrapper. */
  contentClassName?: string;
}

/** Standard titled content container used across admin screens. */
const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ title, description, action, children, className, contentClassName, ...props }, ref) => {
    const hasHeader = Boolean(title || description || action);
    return (
      <GlowCard ref={ref} className={cn('overflow-hidden', className)} {...props}>
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] bg-surface/30 px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
              )}
            </div>
            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
          </div>
        )}
        <div className={cn('p-5', contentClassName)}>{children}</div>
      </GlowCard>
    );
  },
);
SectionCard.displayName = 'SectionCard';

export { SectionCard };
