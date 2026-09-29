import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatEnum } from '@/lib/format';
import { CHALLENGE_TYPES, type ChallengeType } from '../challenges.types';

export interface ChallengeFilterState {
  type: ChallengeType | '';
  is_active: '' | 'true' | 'false';
}

export const emptyChallengeFilters: ChallengeFilterState = { type: '', is_active: '' };

export interface ChallengeFiltersProps {
  value: ChallengeFilterState;
  onChange: (next: ChallengeFilterState) => void;
}

/** Type + status filter bar for the challenges list (server-side). */
function ChallengeFilters({ value, onChange }: ChallengeFiltersProps) {
  const set = <K extends keyof ChallengeFilterState>(key: K, v: ChallengeFilterState[K]) =>
    onChange({ ...value, [key]: v });

  const hasActive = Boolean(value.type || value.is_active);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        aria-label="Filter by type"
        className="sm:w-40"
        value={value.type}
        onChange={(e) => set('type', e.target.value as ChallengeType | '')}
      >
        <option value="">All types</option>
        {CHALLENGE_TYPES.map((t) => (
          <option key={t} value={t}>
            {formatEnum(t)}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by status"
        className="sm:w-40"
        value={value.is_active}
        onChange={(e) => set('is_active', e.target.value as ChallengeFilterState['is_active'])}
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyChallengeFilters })}>
          Clear
        </Button>
      )}
    </div>
  );
}

export { ChallengeFilters };
