export type TournamentSection = 'freefire' | 'blastx';

export const FF_LIVE_TAG = '[FF Live]';
export const BLASTX_TAG = '[BlastX]';

export const FF_LIVE_DESC_TAG = '[SECTION:FREEFIRE_LIVE]';
export const BLASTX_DESC_TAG = '[SECTION:BLASTX]';

/**
 * Determines whether a tournament belongs to Free Fire Live or BlastX E-Sports.
 * Relies on explicit tags, game_slug, and title heuristics so existing and new
 * tournaments are cleanly categorized without requiring backend schema alterations.
 */
export function getTournamentSection(t: {
  title?: string;
  description?: string | null;
  game_slug?: string;
}): TournamentSection {
  const title = t.title || '';
  const desc = t.description || '';
  const slug = t.game_slug || '';

  if (
    title.startsWith(FF_LIVE_TAG) ||
    desc.includes(FF_LIVE_DESC_TAG) ||
    slug === 'free_fire_live'
  ) {
    return 'freefire';
  }

  if (
    title.startsWith(BLASTX_TAG) ||
    desc.includes(BLASTX_DESC_TAG) ||
    slug === 'blastx' ||
    /blastx/i.test(title)
  ) {
    return 'blastx';
  }

  // If game_slug is explicitly free_fire and not branded BlastX, categorize as freefire
  if (slug === 'free_fire') {
    return 'freefire';
  }

  // Default to BlastX for internal esports
  return 'blastx';
}

/** Strips internal tag prefix from tournament title for display. */
export function cleanTournamentTitle(title: string): string {
  if (!title) return '';
  return title.replace(/^\[(FF Live|BlastX|Free Fire)\]\s*/i, '').trim();
}

/** Formats title with section tag on save. */
export function formatSectionTitle(title: string, section: TournamentSection): string {
  const clean = cleanTournamentTitle(title);
  const tag = section === 'freefire' ? FF_LIVE_TAG : BLASTX_TAG;
  return `${tag} ${clean}`;
}

/** Appends metadata marker to description for bulletproof filtering. */
export function formatSectionDescription(
  desc: string | undefined,
  section: TournamentSection,
): string | undefined {
  if (!desc) return undefined;
  const tag = section === 'freefire' ? FF_LIVE_DESC_TAG : BLASTX_DESC_TAG;
  const cleaned = desc.replace(/\[SECTION:(FREEFIRE_LIVE|BLASTX)\]/g, '').trim();
  return cleaned ? `${cleaned}\n\n${tag}` : tag;
}
