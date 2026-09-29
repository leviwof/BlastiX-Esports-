import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatEnum } from '@/lib/format';
import { USER_ROLES, type UserRole } from '../users.types';

export interface UserFilterState {
  search: string;
  role: UserRole | '';
  is_active: '' | 'true' | 'false';
}

export const emptyUserFilters: UserFilterState = { search: '', role: '', is_active: '' };

export interface UsersFiltersProps {
  value: UserFilterState;
  onChange: (next: UserFilterState) => void;
}

/** Search + role + status filter bar for the users list (all server-side). */
function UsersFilters({ value, onChange }: UsersFiltersProps) {
  const set = <K extends keyof UserFilterState>(key: K, v: UserFilterState[K]) =>
    onChange({ ...value, [key]: v });

  const hasActive = Boolean(value.search.trim() || value.role || value.is_active);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search users by name or email"
          placeholder="Search by name or email…"
          value={value.search}
          onChange={(e) => set('search', e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        aria-label="Filter by role"
        className="sm:w-40"
        value={value.role}
        onChange={(e) => set('role', e.target.value as UserRole | '')}
      >
        <option value="">All roles</option>
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {formatEnum(r)}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by status"
        className="sm:w-40"
        value={value.is_active}
        onChange={(e) => set('is_active', e.target.value as UserFilterState['is_active'])}
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Banned</option>
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyUserFilters })}>
          Clear
        </Button>
      )}
    </div>
  );
}

export { UsersFilters };
