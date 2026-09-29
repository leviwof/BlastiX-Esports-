import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Text rendered next to the toggle (also the accessible label). */
  label?: React.ReactNode;
  /** Optional helper line under the label. */
  hint?: React.ReactNode;
}

/**
 * Accessible boolean toggle backed by a real checkbox, so it works with plain
 * React Hook Form `register()` (RHF reads `.checked`) and `fireEvent.click` in
 * tests. Rendered as a switch visually; the checkbox stays screen-reader native.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex cursor-pointer select-none items-center gap-3',
          props.disabled && 'cursor-not-allowed opacity-60',
          className,
        )}
      >
        <span className="relative inline-flex shrink-0">
          <input id={id} type="checkbox" role="switch" ref={ref} className="peer sr-only" {...props} />
          <span className="h-5 w-9 rounded-full border border-border bg-surface-elevated transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground-muted transition-transform peer-checked:translate-x-4 peer-checked:bg-primary-foreground" />
        </span>
        {(label || hint) && (
          <span className="min-w-0">
            {label && <span className="block text-sm text-foreground-soft">{label}</span>}
            {hint && <span className="block text-[11px] text-foreground-muted">{hint}</span>}
          </span>
        )}
      </label>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
