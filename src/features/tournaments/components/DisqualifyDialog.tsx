import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Field } from '@/components/shared/Field';
import { Textarea } from '@/components/ui/textarea';
import { useDisqualifyRegistration } from '../tournaments.hooks';
import type { TournamentRegistration } from '../tournaments.types';

export interface DisqualifyDialogProps {
  tournamentId: string;
  /** The registration to disqualify; the dialog is open while this is set. */
  registration: TournamentRegistration | null;
  onClose: () => void;
}

/** Confirm + capture a required reason before disqualifying a registration. */
function DisqualifyDialog({ tournamentId, registration, onClose }: DisqualifyDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const disqualify = useDisqualifyRegistration(tournamentId);

  // Reset the field each time a different participant is targeted.
  useEffect(() => {
    setReason('');
    setError(undefined);
  }, [registration?.id]);

  const name = registration?.user?.name ?? registration?.team?.name ?? 'this participant';

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A reason is required.');
      return;
    }
    if (!registration) return;
    disqualify.mutate(
      { registration_id: registration.id, reason: reason.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <ConfirmDialog
      open={Boolean(registration)}
      title="Disqualify participant"
      description={`This removes ${name} from the standings. This cannot be undone from the panel.`}
      confirmLabel="Disqualify"
      destructive
      loading={disqualify.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Field label="Reason" htmlFor="dq-reason" required error={error}>
        <Textarea
          id="dq-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Confirmed teaming / rule violation"
        />
      </Field>
    </ConfirmDialog>
  );
}

export { DisqualifyDialog };
