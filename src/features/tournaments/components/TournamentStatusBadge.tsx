import { StatusBadge } from '@/components/shared/StatusBadge';
import { statusToBadge } from '../tournaments.utils';

/** Renders any backend tournament status string as the themed status pill. */
function TournamentStatusBadge({ status, className }: { status: string; className?: string }) {
  if (status === 'REGISTRATION_OPEN' || status === 'REGISTRATION_CLOSED') {
    return null;
  }
  return <StatusBadge status={statusToBadge(status)} className={className} />;
}

export { TournamentStatusBadge };
