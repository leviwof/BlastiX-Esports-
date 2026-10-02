import {
  LayoutDashboard,
  Users,
  Trophy,
  Radio,
  Swords,
  BarChart3,
  Users2,
  Target,
  ShieldCheck,
  Megaphone,
  Settings,
  Flame,
  Zap,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Backend support level for a module — every module is now backed by a real
 * endpoint, so this is kept only for potential future gating.
 */
export type NavSupport = 'full' | 'read' | 'derived' | 'blocked';

/** Which live count (if any) drives the green badge next to a nav item. */
export type NavBadge = 'live' | 'pendingProofs';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  support: NavSupport;
  badge?: NavBadge;
}

export interface NavGroup {
  /** Section heading shown above the group (omitted for the top item). */
  label?: string;
  items: NavItem[];
}

/** Sidebar navigation, grouped by area of work with distinct Free Fire Live & BlastX sections. */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, support: 'derived' }],
  },
  {
    label: '🔥 Free Fire Live',
    items: [
      { label: 'Live Tournaments', to: '/freefire/live', icon: Radio, support: 'full', badge: 'live' },
      { label: 'Manage Tournaments', to: '/freefire/tournaments', icon: Flame, support: 'full' },
      { label: 'Create Tournament', to: '/freefire/tournaments/new', icon: PlusCircle, support: 'full' },
    ],
  },
  {
    label: '⚡ BlastX E-Sports',
    items: [
      { label: 'Live Tournaments', to: '/blastx/live', icon: Zap, support: 'full' },
      { label: 'Manage Tournaments', to: '/blastx/tournaments', icon: Trophy, support: 'full' },
      { label: 'Create Tournament', to: '/blastx/tournaments/new', icon: PlusCircle, support: 'full' },
    ],
  },
  {
    label: 'Competition Hub',
    items: [
      { label: 'All Tournaments', to: '/tournaments', icon: Trophy, support: 'full' },
      { label: 'Matches', to: '/matches', icon: Swords, support: 'full' },
      { label: 'Live Arena', to: '/live', icon: Radio, support: 'full', badge: 'live' },
      { label: 'Leaderboards', to: '/leaderboards', icon: BarChart3, support: 'read' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Users', to: '/users', icon: Users, support: 'full' },
      { label: 'Teams', to: '/teams', icon: Users2, support: 'read' },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { label: 'Proof Verification', to: '/proofs', icon: ShieldCheck, support: 'full', badge: 'pendingProofs' },
      { label: 'Challenges', to: '/challenges', icon: Target, support: 'full' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Content', to: '/content', icon: Megaphone, support: 'full' },
      { label: 'Settings', to: '/settings', icon: Settings, support: 'full' },
    ],
  },
];

/** Flattened list, for consumers that don't care about grouping. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
