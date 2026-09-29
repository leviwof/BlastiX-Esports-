import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as a destructive action. */
  destructive?: boolean;
  /** Disable actions and show a working label while the request is in flight. */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Optional extra content (e.g. a required reason field). */
  children?: React.ReactNode;
}

/** Modal confirmation for high-impact actions (cancel, disqualify, finalize). */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export { ConfirmDialog };
