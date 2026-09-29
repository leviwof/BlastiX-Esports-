import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatEnum } from '@/lib/format';
import type { TeamMember } from '../teams.types';

export interface RosterTableProps {
  members: TeamMember[];
}

/** Team roster — one row per member; the captain is highlighted. */
function RosterTable({ members }: RosterTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-foreground-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Player</th>
            <th className="px-5 py-3 font-medium">In-game name</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3 font-medium text-foreground-soft">{m.name}</td>
              <td className="px-5 py-3 text-foreground-muted">{m.in_game_name || '—'}</td>
              <td className="px-5 py-3">
                <Badge variant={m.role === 'CAPTAIN' ? 'gold' : 'secondary'}>
                  {formatEnum(m.role)}
                </Badge>
              </td>
              <td className="px-5 py-3 text-foreground-muted">{formatDateTime(m.joined_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { RosterTable };
