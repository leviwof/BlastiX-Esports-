import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Neutral "nothing here" panel with an optional call to action. */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-center', className)}>
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-foreground-muted">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div>
        <p className="font-display text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-foreground-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
