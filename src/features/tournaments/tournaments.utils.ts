import type { BadgeStatus } from '@/components/shared/StatusBadge';

/**
 * Tournament-specific presentation helper. The generic date / enum formatters
 * now live in `@/lib/format` and are re-exported here so existing tournament
 * imports keep working unchanged.
 */

/** Map a backend tournament status string to a StatusBadge variant. */
export function statusToBadge(status: string): BadgeStatus {
  switch (status) {
    case 'LIVE':
      return 'LIVE';
    case 'UPCOMING':
      return 'UPCOMING';
    case 'REGISTRATION_OPEN':
      return 'REGISTRATION_OPEN';
    case 'REGISTRATION_CLOSED':
      return 'REGISTRATION_CLOSED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'DRAFT':
    default:
      return 'DRAFT';
  }
}

export { formatEnum, formatDateTime, toDateTimeLocal, fromDateTimeLocal } from '@/lib/format';
