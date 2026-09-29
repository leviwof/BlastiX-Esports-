import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Convenience: render these instead of passing <option> children. */
  options?: SelectOption[];
}

/**
 * Lightweight styled wrapper over a native <select>. Native keeps the bundle
 * small (no extra Radix dep) and makes the control trivially testable with
 * `fireEvent.change` under jsdom.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border border-white/10 bg-surface/75 px-3 py-1 pr-9 text-sm text-foreground shadow-sm transition-all',
            'hover:border-primary/40',
            'focus-visible:border-primary focus-visible:shadow-[0_0_15px_rgba(17,251,190,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
