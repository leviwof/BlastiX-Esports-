import { useEffect, useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Field } from '@/components/shared/Field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSetRoomCredentials } from '../tournaments.hooks';

export interface RoomDialogProps {
  tournamentId: string;
  open: boolean;
  onClose: () => void;
}

interface RoomErrors {
  room_id?: string;
  room_password?: string;
}

/**
 * Set (and optionally immediately release) the in-game room credentials.
 * The backend returns the saved creds on success, but detail reads omit them,
 * so this is a write-only control — a success toast confirms the action.
 */
function RoomDialog({ tournamentId, open, onClose }: RoomDialogProps) {
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [releaseNow, setReleaseNow] = useState(false);
  const [errors, setErrors] = useState<RoomErrors>({});
  const setRoom = useSetRoomCredentials(tournamentId);

  // Clear the form whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setRoomId('');
      setRoomPassword('');
      setReleaseNow(false);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = () => {
    const next: RoomErrors = {};
    if (!roomId.trim()) next.room_id = 'Room ID is required.';
    if (!roomPassword.trim()) next.room_password = 'Room password is required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setRoom.mutate(
      { room_id: roomId.trim(), room_password: roomPassword.trim(), release_now: releaseNow },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Room credentials"
      description="Set the custom-room ID and password. Release now to make them visible to confirmed participants immediately."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={setRoom.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={setRoom.isPending}>
            {setRoom.isPending ? 'Saving…' : releaseNow ? 'Save & release' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Room ID" htmlFor="room-id" required error={errors.room_id}>
          <Input
            id="room-id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. 12345678"
          />
        </Field>
        <Field label="Room password" htmlFor="room-password" required error={errors.room_password}>
          <Input
            id="room-password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            placeholder="Room password"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground-soft">
          <input
            type="checkbox"
            checked={releaseNow}
            onChange={(e) => setReleaseNow(e.target.checked)}
            className="h-4 w-4 rounded border-input bg-surface/50 text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
          Release to participants now
        </label>
      </div>
    </Modal>
  );
}

export { RoomDialog };
