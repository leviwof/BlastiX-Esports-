import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  /** Any thrown value — the user-safe message is extracted via getErrorMessage. */
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

/** Consistent error panel with an optional retry action. */
function ErrorState({ title = 'Something went wrong', error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">{title}</p>
        {error != null && (
          <p className="mt-1 max-w-md text-sm text-foreground-muted">{getErrorMessage(error)}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
