import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-white/10 bg-surface/75 px-3 py-1 text-sm text-foreground shadow-sm transition-all',
          'placeholder:text-foreground-muted/65',
          'hover:border-primary/40',
          'focus-visible:border-primary focus-visible:shadow-[0_0_15px_rgba(17,251,190,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
