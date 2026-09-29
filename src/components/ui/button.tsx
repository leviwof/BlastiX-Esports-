import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Free Fire signature electric mint gradient CTA with dark high-contrast typography
        default:
          'bg-gradient-to-r from-primary via-[#00f5a0] to-[#00d084] text-[#080B10] font-bold shadow-glow hover:shadow-glow-strong hover:scale-[1.01] active:scale-[0.98]',
        // Free Fire Championship Gold variant for tournaments, rankings, prizes
        gold:
          'bg-gradient-to-r from-[#FFBA00] to-[#FF9100] text-[#080B10] font-bold shadow-glow-gold hover:scale-[1.01] active:scale-[0.98]',
        // Tactical glass outline
        outline:
          'border border-primary/45 bg-primary/[0.04] text-primary hover:bg-primary/15 hover:border-primary hover:shadow-glow',
        // Tactical dark-gunmetal surface
        secondary:
          'border border-white/10 bg-surface-2/90 text-foreground-soft hover:bg-surface-elevated hover:border-white/20 hover:text-white',
        ghost:
          'text-foreground-muted hover:bg-surface-2/70 hover:text-primary',
        // Destructive / Combat alert button
        destructive:
          'border border-danger/50 bg-danger/15 text-danger hover:bg-danger/25 hover:shadow-glow-danger',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs tracking-wide',
        lg: 'h-10 px-6 font-bold tracking-wider',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
