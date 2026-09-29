import { cn } from '@/lib/utils';
import { Button } from './button';

export interface PaginationProps {
  /** Current 1-based page. */
  page: number;
  /** Page size (used to derive the total page count). */
  limit: number;
  /** Total number of records across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /** Disable the controls while a request is in flight. */
  disabled?: boolean;
  className?: string;
}

/**
 * Prev/next pager shared by every paginated list. Renders nothing when there is
 * only a single page, so callers can drop it in unconditionally.
 */
function Pagination({ page, limit, total, onPageChange, disabled, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-border pt-4 text-sm',
        className,
      )}
    >
      <span className="text-foreground-muted">
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export { Pagination };
