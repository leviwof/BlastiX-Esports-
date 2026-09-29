import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Field } from '@/components/shared/Field';
import { Textarea } from '@/components/ui/textarea';
import { useRejectProof } from '../proofs.hooks';
import { rejectProofSchema } from '../proofs.schema';
import type { Proof } from '../proofs.types';

export interface RejectProofDialogProps {
  /** The proof to reject; the dialog is open while this is set. */
  proof: Proof | null;
  onClose: () => void;
}

/** Confirm + capture a required reason before rejecting a submitted proof. */
function RejectProofDialog({ proof, onClose }: RejectProofDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const reject = useRejectProof();

  // Reset the field each time a different proof is targeted.
  useEffect(() => {
    setReason('');
    setError(undefined);
  }, [proof?.id]);

  const handleConfirm = () => {
    const parsed = rejectProofSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'A reason is required.');
      return;
    }
    if (!proof) return;
    reject.mutate({ id: proof.id, reason: parsed.data.reason }, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={Boolean(proof)}
      title="Reject proof"
      description={
        proof
          ? `Reject ${proof.user.name}'s proof for "${proof.challenge.title}"? They'll see the reason and can resubmit.`
          : undefined
      }
      confirmLabel="Reject proof"
      destructive
      loading={reject.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Field
        label="Reason"
        htmlFor="reject-reason"
        required
        error={error}
        hint="Shared with the player so they know what to fix."
      >
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. The recording doesn't show the full match result."
        />
      </Field>
    </ConfirmDialog>
  );
}

export { RejectProofDialog };
