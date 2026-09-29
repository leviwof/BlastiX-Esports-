import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  TEAM_MODES,
  TOURNAMENT_FORMATS,
  TOURNAMENT_STATUSES,
  type TeamMode,
  type TournamentFormat,
  type TournamentStatus,
} from '../tournaments.types';
import { formatEnum } from '../tournaments.utils';

export interface TournamentFilterState {
  status: TournamentStatus | '';
  team_mode: TeamMode | '';
  format: TournamentFormat | '';
  /** Client-side title search over the current page of results. */
  search: string;
}

export const emptyFilters: TournamentFilterState = { status: '', team_mode: '', format: '', search: '' };

export interface TournamentFiltersProps {
  value: TournamentFilterState;
  onChange: (next: TournamentFilterState) => void;
  /** Hide the status control (used where status is locked, e.g. the Live view). */
  hideStatus?: boolean;
}

/**
 * Tournament list filters. Status / team mode / format map to real backend
 * query params; `search` filters the loaded page client-side (the list API has
 * no title search), and is labelled as such by the caller.
 */
function TournamentFilters({ value, onChange, hideStatus }: TournamentFiltersProps) {
  const set = <K extends keyof TournamentFilterState>(key: K, v: TournamentFilterState[K]) =>
    onChange({ ...value, [key]: v });

  const hasActive =
    value.status || value.team_mode || value.format || value.search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search tournaments by title"
          placeholder="Search this page by title…"
          value={value.search}
          onChange={(e) => set('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {!hideStatus && (
        <Select
          aria-label="Filter by status"
          className="sm:w-auto"
          value={value.status}
          onChange={(e) => set('status', e.target.value as TournamentStatus | '')}
        >
          <option value="">All statuses</option>
          {TOURNAMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatEnum(s)}
            </option>
          ))}
        </Select>
      )}

      <Select
        aria-label="Filter by team mode"
        className="sm:w-auto"
        value={value.team_mode}
        onChange={(e) => set('team_mode', e.target.value as TeamMode | '')}
      >
        <option value="">All modes</option>
        {TEAM_MODES.map((m) => (
          <option key={m} value={m}>
            {formatEnum(m)}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by format"
        className="sm:w-auto"
        value={value.format}
        onChange={(e) => set('format', e.target.value as TournamentFormat | '')}
      >
        <option value="">All formats</option>
        {TOURNAMENT_FORMATS.map((f) => (
          <option key={f} value={f}>
            {formatEnum(f)}
          </option>
        ))}
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyFilters })}>
          Clear
        </Button>
      )}
    </div>
  );
}

export { TournamentFilters };
