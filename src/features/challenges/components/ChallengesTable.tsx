import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEnum } from '@/lib/format';
import type { Challenge } from '../challenges.types';

export interface ChallengesTableProps {
  challenges: Challenge[];
  onEdit: (challenge: Challenge) => void;
  onToggleActive: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
  /** Disable a row's actions while a mutation targeting it is in flight. */
  busyId?: string | null;
}

function typeVariant(type: string): 'gold' | 'default' | 'secondary' {
  if (type === 'SPECIAL') return 'gold';
  if (type === 'WEEKLY') return 'default';
  return 'secondary';
}

/** Challenge list with edit / soft-disable / hard-delete row actions. */
function ChallengesTable({
  challenges,
  onEdit,
  onToggleActive,
  onDelete,
  busyId,
}: ChallengesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-foreground-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Challenge</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">XP</th>
            <th className="px-5 py-3 font-medium">Target</th>
            <th className="px-5 py-3 font-medium">Recording</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((c) => {
            const busy = busyId === c.id;
            return (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">
                  <span className="block font-medium text-foreground-soft">{c.title}</span>
                  <span className="block max-w-md truncate text-xs text-foreground-muted">
                    {c.description}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={typeVariant(c.type)}>{formatEnum(c.type)}</Badge>
                </td>
                <td className="px-5 py-3 text-foreground-muted">{c.reward_xp.toLocaleString()}</td>
                <td className="px-5 py-3 text-foreground-muted">{c.target_progress}</td>
                <td className="px-5 py-3 text-foreground-muted">
                  {c.requires_recording ? 'Required' : 'Optional'}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={c.is_active ? 'success' : 'secondary'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(c)} disabled={busy}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(c)}
                      disabled={busy}
                    >
                      {c.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(c)}
                      disabled={busy}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { ChallengesTable };
