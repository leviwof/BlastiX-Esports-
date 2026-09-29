import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/** App toaster, themed to the BlastIX dark/cyan tokens. */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          '--normal-bg': 'rgb(var(--surface-2))',
          '--normal-text': 'rgb(var(--text-soft))',
          '--normal-border': 'rgb(var(--primary) / 0.25)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group border-primary/20 bg-popover text-popover-foreground shadow-glow-md rounded-md',
          description: 'text-foreground-muted',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-surface-elevated text-foreground-soft',
          error: 'text-danger',
          success: 'text-success',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
