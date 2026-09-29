import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import { getInitials } from '@/lib/utils';
import { UserActions } from './UserActions';
import type { ManagedUser } from '../users.types';

export interface UsersTableProps {
  users: ManagedUser[];
}

/** Paginated, moderation-ready users table. */
function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-foreground-muted">
          <tr>
            <th className="px-5 py-3 font-medium">User</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">XP</th>
            <th className="px-5 py-3 font-medium">Rank</th>
            <th className="px-5 py-3 font-medium">Joined</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3">
                <Link to={`/users/${u.id}`} className="group flex items-center gap-3">
                  {u.profile_pic ? (
                    <img
                      src={u.profile_pic}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(u.name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground-soft group-hover:text-primary">
                      {u.name}
                    </span>
                    <span className="block truncate text-xs text-foreground-muted">{u.email}</span>
                  </span>
                </Link>
              </td>
              <td className="px-5 py-3">
                <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
              </td>
              <td className="px-5 py-3">
                <Badge variant={u.is_active ? 'success' : 'danger'}>
                  {u.is_active ? 'Active' : 'Banned'}
                </Badge>
              </td>
              <td className="px-5 py-3 text-foreground-muted">{u.xp.toLocaleString()}</td>
              <td className="px-5 py-3 text-foreground-muted">{u.rank ? `#${u.rank}` : '—'}</td>
              <td className="px-5 py-3 text-foreground-muted">{formatDateTime(u.created_at)}</td>
              <td className="px-5 py-3">
                <UserActions user={u} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { UsersTable };
