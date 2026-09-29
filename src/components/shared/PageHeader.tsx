import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Breadcrumb {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  /** Right-side actions (buttons). */
  actions?: React.ReactNode;
  className?: string;
}

/** Standard page title block: breadcrumbs, esports-style title, actions. */
function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-foreground-muted">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {crumb.to && !last ? (
                    <Link to={crumb.to} className="transition-colors hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={cn(last && 'text-foreground-soft')}>{crumb.label}</span>
                  )}
                  {!last && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-foreground">
              {title}
            </h1>
          </div>

          {/* Free Fire signature angled slash title decoration */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg viewBox="0 0 165 9" className="h-2 w-auto fill-primary drop-shadow-[0_0_8px_rgba(17,251,190,0.6)]" aria-hidden="true">
              <path d="M129.4 0L121.28 8.12H0V0H129.4Z" />
              <path d="M141.16 0L133.04 8.12H128.45L136.57 0H141.16Z" />
              <path d="M152.92 0L144.8 8.12H140.2L148.33 0H152.92Z" />
              <path d="M164.68 0L156.55 8.12H151.96L160.09 0H164.68Z" />
            </svg>
            <div className="h-[2px] w-16 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>

          {description && <p className="mt-2 text-sm text-foreground-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export { PageHeader };
