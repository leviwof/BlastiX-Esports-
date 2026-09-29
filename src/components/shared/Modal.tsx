import * as React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Right-aligned action row rendered under the body. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Minimal accessible modal rendered inline (no portal) — mirrors the app's
 * existing off-canvas drawer pattern. Inline rendering keeps it easy to assert
 * against in jsdom tests. Escape and overlay click both close it.
 */
function Modal({ open, onClose, title, description, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-primary/20 bg-background-elevated p-6 shadow-glow-strong',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold tracking-wide text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-foreground-muted">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 -mt-2 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export { Modal };
