import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUpdateUser } from '../users.hooks';
import type { ManagedUser } from '../users.types';

export interface UserActionsProps {
  user: ManagedUser;
  /** `sm` in table rows, `default` on the detail page. */
  size?: 'sm' | 'default';
}

/**
 * Ban / unban and role-change controls, shared by the users table and the
 * detail page. Both actions route through a `ConfirmDialog` because they are
 * moderation-sensitive (a role change grants or revokes full admin access).
 */
function UserActions({ user, size = 'sm' }: UserActionsProps) {
  const update = useUpdateUser(user.id);
  const [confirm, setConfirm] = useState<null | 'ban' | 'role'>(null);

  const isAdmin = user.role === 'ADMIN';
  const nextRole = isAdmin ? 'PLAYER' : 'ADMIN';
  const close = () => setConfirm(null);

  const applyBan = () => update.mutate({ is_active: !user.is_active }, { onSuccess: close });
  const applyRole = () => update.mutate({ role: nextRole }, { onSuccess: close });

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={() => setConfirm('role')}
        disabled={update.isPending}
      >
        {isAdmin ? 'Make player' : 'Make admin'}
      </Button>
      <Button
        variant={user.is_active ? 'destructive' : 'outline'}
        size={size}
        onClick={() => setConfirm('ban')}
        disabled={update.isPending}
      >
        {user.is_active ? 'Ban' : 'Unban'}
      </Button>

      <ConfirmDialog
        open={confirm === 'ban'}
        title={user.is_active ? 'Ban user' : 'Unban user'}
        description={
          user.is_active
            ? `${user.name} will immediately lose access until reinstated.`
            : `${user.name} will regain access to the platform.`
        }
        confirmLabel={user.is_active ? 'Ban user' : 'Unban user'}
        destructive={user.is_active}
        loading={update.isPending}
        onConfirm={applyBan}
        onClose={close}
      />
      <ConfirmDialog
        open={confirm === 'role'}
        title={isAdmin ? 'Revoke admin access' : 'Grant admin access'}
        description={
          isAdmin
            ? `${user.name} will become a regular player and lose access to this panel.`
            : `${user.name} will gain full admin access to this panel.`
        }
        confirmLabel={isAdmin ? 'Make player' : 'Make admin'}
        destructive={isAdmin}
        loading={update.isPending}
        onConfirm={applyRole}
        onClose={close}
      />
    </div>
  );
}

export { UserActions };
