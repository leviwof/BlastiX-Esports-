import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render a persistent (subtle) outer glow. */
  glow?: boolean;
  /** Add hover lift + brighter border/glow for clickable cards. */
  interactive?: boolean;
}

/**
 * Base Blastix surface: tactical obsidian card with subtle neon rim light and border.
 * Electric mint glow appears on hover for interactive cards.
 */
const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glow = false, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border border-white/[0.09] bg-[#101622]/90 backdrop-blur-md overflow-hidden transition-all duration-200',
          // Top subtle neon rim line
          'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent before:pointer-events-none',
          glow && 'shadow-glow border-primary/30',
          interactive &&
            'cursor-pointer hover:border-primary/50 hover:shadow-glow-md hover:-translate-y-1 hover:before:via-primary/70',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlowCard.displayName = 'GlowCard';

export { GlowCard };
