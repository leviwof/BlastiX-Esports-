/**
 * Shared presentation helpers used across every feature. Pure functions — no
 * side effects — so they are trivial to unit test and safe to reuse in cards,
 * tables, forms and dashboards. Feature-specific mappers (e.g. a tournament
 * status → StatusBadge variant) stay in their own feature's `*.utils.ts`.
 */

/** 'BATTLE_ROYALE' → 'Battle Royale', 'REGISTRATION_OPEN' → 'Registration Open'. */
export function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Human-readable date + time in the viewer's locale; '—' for empty/invalid. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** ISO string → the local value a <input type="datetime-local"> expects. */
export function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** A local datetime-local value → an ISO string for the API ('' → undefined). */
export function fromDateTimeLocal(local?: string): string | undefined {
  if (!local) return undefined;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}
