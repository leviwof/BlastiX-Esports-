import { SectionCard } from '@/components/shared/SectionCard';
import { Switch } from '@/components/ui/Switch';
import { useUpdateUser } from '../users.hooks';
import type { ManagedUser } from '../users.types';

function ProfileBadgeControls({ user }: { user: ManagedUser }) {
  const update = useUpdateUser(user.id);

  return (
    <SectionCard
      title="Profile badges"
      description="Control the VIP and crown indicators shown on this player's profile."
    >
      <div className="flex flex-wrap gap-x-10 gap-y-5">
        <Switch
          id="user-vip"
          label="VIP status"
          hint="Enables the VIP badge in the app."
          checked={user.is_vip ?? false}
          disabled={update.isPending}
          onChange={(event) => update.mutate({ is_vip: event.currentTarget.checked })}
        />
        <Switch
          id="user-crown"
          label="Crown badge unlocked"
          hint="Shows the gold crown on the user's avatar."
          checked={user.crown_badge_unlocked ?? false}
          disabled={update.isPending}
          onChange={(event) => update.mutate({ crown_badge_unlocked: event.currentTarget.checked })}
        />
      </div>
    </SectionCard>
  );
}

export { ProfileBadgeControls };
