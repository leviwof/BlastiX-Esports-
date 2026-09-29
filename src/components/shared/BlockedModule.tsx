import { Ban, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlowCard } from '@/components/shared/GlowCard';

export interface BlockedModuleProps {
  title: string;
  summary: string;
  icon?: LucideIcon;
  /** Exact backend endpoints / models the backend must add for this module. */
  requires: string[];
}

/**
 * Placeholder for modules with no admin API on the deployed backend. States the
 * gap plainly and lists the exact endpoints the backend owner must add — and
 * deliberately shows NO sample/mock records.
 */
function BlockedModule({ title, summary, icon: Icon = Ban, requires }: BlockedModuleProps) {
  return (
    <div>
      <PageHeader
        title={title}
        description={summary}
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: title }]}
      />
      <GlowCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-foreground">
              Backend endpoint not currently available
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              This module has no admin API on the deployed backend yet, so there is nothing to
              operate here. No placeholder or sample data is shown by design.
            </p>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                Requires backend work
              </p>
              <ul className="mt-2 space-y-1.5">
                {requires.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/70"
                      aria-hidden="true"
                    />
                    <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-foreground-soft">
                      {r}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export { BlockedModule };
