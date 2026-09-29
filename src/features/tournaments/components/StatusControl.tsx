import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TOURNAMENT_STATUSES, type Tournament, type TournamentStatus } from '../tournaments.types';
import { formatEnum } from '../tournaments.utils';
import { useFinalizeTournament, useUpdateTournamentStatus } from '../tournaments.hooks';

export interface StatusControlProps {
  tournament: Tournament;
}

/**
 * Status lifecycle controls for a tournament: change status (cancelling is
 * confirmed, as it is the only "removal" the backend supports), and finalize
 * standings (confirmed — it is irreversible from the panel).
 */
function StatusControl({ tournament }: StatusControlProps) {
  const [nextStatus, setNextStatus] = useState<TournamentStatus>(
    tournament.status as TournamentStatus,
  );
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  const updateStatus = useUpdateTournamentStatus(tournament.id);
  const finalize = useFinalizeTournament(tournament.id);

  // Keep the selector in sync when the tournament refetches after a change.
  useEffect(() => {
    setNextStatus(tournament.status as TournamentStatus);
  }, [tournament.status]);

  const unchanged = nextStatus === tournament.status;

  const applyStatus = () => {
    if (nextStatus === 'CANCELLED') {
      setConfirmCancel(true);
      return;
    }
    updateStatus.mutate({ status: nextStatus });
  };

  const confirmCancelStatus = () => {
    updateStatus.mutate(
      { status: 'CANCELLED' },
      { onSuccess: () => setConfirmCancel(false) },
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="w-full sm:w-56">
          <label htmlFor="status-select" className="mb-1 block text-xs font-medium text-foreground-soft">
            Status
          </label>
          <Select
            id="status-select"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as TournamentStatus)}
          >
            {TOURNAMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatEnum(s)}
              </option>
            ))}
          </Select>
        </div>
        <Button
          onClick={applyStatus}
          disabled={unchanged || updateStatus.isPending}
          className="sm:mt-5"
        >
          {updateStatus.isPending ? 'Updating…' : 'Apply status'}
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={() => setConfirmFinalize(true)}
        disabled={finalize.isPending}
        className="sm:mt-5"
      >
        <Flag className="h-4 w-4" />
        Finalize standings
      </Button>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel tournament"
        description="This sets the tournament to Cancelled. There is no delete — this is how a tournament is removed from active play."
        confirmLabel="Cancel tournament"
        cancelLabel="Keep tournament"
        destructive
        loading={updateStatus.isPending}
        onConfirm={confirmCancelStatus}
        onClose={() => {
          setConfirmCancel(false);
          setNextStatus(tournament.status as TournamentStatus);
        }}
      />

      <ConfirmDialog
        open={confirmFinalize}
        title="Finalize standings"
        description="This locks in the final standings from the recorded match results. Do this only once all matches are complete."
        confirmLabel="Finalize"
        loading={finalize.isPending}
        onConfirm={() => finalize.mutate(undefined, { onSuccess: () => setConfirmFinalize(false) })}
        onClose={() => setConfirmFinalize(false)}
      />
    </div>
  );
}

export { StatusControl };
