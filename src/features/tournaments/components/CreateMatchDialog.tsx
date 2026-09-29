import { useEffect, useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Field } from '@/components/shared/Field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateMatch } from '../tournaments.hooks';
import { fromDateTimeLocal } from '../tournaments.utils';

export interface CreateMatchDialogProps {
  tournamentId: string;
  open: boolean;
  onClose: () => void;
  /** Pre-fill the map with the tournament's default. */
  defaultMap?: string;
  /** Pre-fill the next sequential match number. */
  nextMatchNumber?: number;
}

interface MatchErrors {
  match_number?: string;
  map?: string;
  scheduled_at?: string;
}

/** Create a match (round) within a tournament. */
function CreateMatchDialog({
  tournamentId,
  open,
  onClose,
  defaultMap,
  nextMatchNumber = 1,
}: CreateMatchDialogProps) {
  const [matchNumber, setMatchNumber] = useState(String(nextMatchNumber));
  const [map, setMap] = useState(defaultMap ?? '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [errors, setErrors] = useState<MatchErrors>({});
  const createMatch = useCreateMatch(tournamentId);

  useEffect(() => {
    if (open) {
      setMatchNumber(String(nextMatchNumber));
      setMap(defaultMap ?? '');
      setScheduledAt('');
      setErrors({});
    }
  }, [open, nextMatchNumber, defaultMap]);

  const handleSubmit = () => {
    const next: MatchErrors = {};
    const num = Number(matchNumber);
    if (!matchNumber.trim() || !Number.isInteger(num) || num < 1) {
      next.match_number = 'Enter a match number (1 or higher).';
    }
    if (!map.trim()) next.map = 'Map is required.';
    const iso = fromDateTimeLocal(scheduledAt);
    if (!iso) next.scheduled_at = 'A scheduled time is required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    createMatch.mutate(
      { match_number: num, map: map.trim(), scheduled_at: iso as string },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create match"
      description="Add a match (round) to this tournament. Results are recorded per match once it is played."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createMatch.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMatch.isPending}>
            {createMatch.isPending ? 'Creating…' : 'Create match'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Match number" htmlFor="match-number" required error={errors.match_number}>
          <Input
            id="match-number"
            type="number"
            min={1}
            value={matchNumber}
            onChange={(e) => setMatchNumber(e.target.value)}
          />
        </Field>
        <Field label="Map" htmlFor="match-map" required error={errors.map}>
          <Input
            id="match-map"
            value={map}
            onChange={(e) => setMap(e.target.value)}
            placeholder="e.g. Bermuda"
          />
        </Field>
        <Field label="Scheduled at" htmlFor="match-scheduled" required error={errors.scheduled_at}>
          <Input
            id="match-scheduled"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

export { CreateMatchDialog };
