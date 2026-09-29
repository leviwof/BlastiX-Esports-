import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatEnum } from '@/lib/format';
import { getInitials } from '@/lib/utils';
import type { TeamSummary } from '../teams.types';

export interface TeamsTableProps {
  teams: TeamSummary[];
}

/** Read-only teams list; each row links through to the roster detail. */
function TeamsTable({ teams }: TeamsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-foreground-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Team</th>
            <th className="px-5 py-3 font-medium">Game</th>
            <th className="px-5 py-3 font-medium">Captain</th>
            <th className="px-5 py-3 font-medium">Members</th>
            <th className="px-5 py-3 font-medium">Subs</th>
            <th className="px-5 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3">
                <Link to={`/teams/${t.id}`} className="group flex items-center gap-3">
                  {t.logo_url ? (
                    <img
                      src={t.logo_url}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(t.name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground-soft group-hover:text-primary">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-foreground-muted">[{t.tag}]</span>
                  </span>
                </Link>
              </td>
              <td className="px-5 py-3 text-foreground-muted">{formatEnum(t.game_slug)}</td>
              <td className="px-5 py-3 text-foreground-soft">{t.captain?.name ?? '—'}</td>
              <td className="px-5 py-3 text-foreground-muted">{t.member_count}</td>
              <td className="px-5 py-3">
                <Badge variant={t.accepting_substitutes ? 'success' : 'secondary'}>
                  {t.accepting_substitutes ? 'Open' : 'Closed'}
                </Badge>
              </td>
              <td className="px-5 py-3 text-foreground-muted">{formatDateTime(t.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { TeamsTable };
