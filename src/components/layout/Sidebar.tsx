import { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Flame,
  PanelLeftClose,
  Zap,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS, type NavBadge, type NavGroup, type NavItem } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { useStats } from '@/features/stats/stats.hooks';

export interface SidebarProps {
  /** 'desktop' or 'drawer' */
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

const STORAGE_KEY = 'blastix_sidebar_expanded_sections';

/** One grouped, badge-aware navigation link. */
function SidebarLink({
  item,
  count,
  accent,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  count: number;
  accent?: NavGroup['accent'];
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isLiveBadge = item.badge === 'live';
  const isFreeFireLive = item.to === '/freefire/live';
  const isCreateRoute = item.label === 'Create Tournament';
  const activeClass =
    accent === 'freefire'
      ? 'bg-amber-400/15 text-amber-200 border border-amber-300/35 shadow-[0_0_18px_rgba(251,191,36,0.13)] font-semibold'
      : 'bg-primary/15 text-primary border border-primary/35 shadow-[0_0_16px_rgba(17,251,190,0.18)] font-semibold';
  const activeIndicatorClass =
    accent === 'freefire'
      ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.85)]'
      : 'bg-primary shadow-[0_0_8px_rgba(17,251,190,0.8)]';
  const isCreateBeingEdited =
    item.label === 'Manage Tournaments' && pathname.startsWith(`${item.to}/new`);

  return (
    <NavLink
      to={item.to}
      end={isCreateRoute}
      onClick={onNavigate}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
          isActive && !isCreateBeingEdited
            ? isFreeFireLive
              ? 'bg-amber-400/15 text-amber-200 border border-amber-300/35 shadow-[0_0_18px_rgba(251,191,36,0.13)] font-semibold'
              : activeClass
            : 'border border-transparent text-foreground-muted hover:border-white/10 hover:bg-surface-2/60 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !isCreateBeingEdited && (
            <span
              aria-hidden="true"
              className={cn('absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full', activeIndicatorClass)}
            />
          )}

          <Icon
            className={cn(
              'h-4 w-4 shrink-0 transition-transform group-hover:scale-105',
              isActive && isFreeFireLive
                ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]'
                : isActive && accent === 'freefire'
                  ? 'text-amber-200'
                  : isActive
                    ? 'text-primary drop-shadow-[0_0_6px_rgba(17,251,190,0.5)]'
                    : 'text-foreground-muted group-hover:text-foreground-soft',
            )}
            aria-hidden="true"
          />
          <span className="truncate font-display tracking-wide flex-1">{item.label}</span>
          {isFreeFireLive && (
            <span
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                isActive ? 'bg-amber-300/20 text-amber-100' : 'bg-white/[0.06] text-foreground-muted',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Live
            </span>
          )}
          {count > 0 && (
            <span
              className={cn(
                'ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-tight',
                isLiveBadge
                  ? 'bg-danger text-white shadow-glow-danger animate-live-pulse'
                  : isActive
                  ? 'bg-primary text-background font-bold shadow-glow'
                  : 'bg-gold/20 text-gold border border-gold/40',
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ onNavigate, onToggleCollapse }: SidebarProps) {
  const { pathname } = useLocation();
  const stats = useStats();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Dashboard group
  const dashboardGroup = NAV_GROUPS.find((g) => !g.label || g.id === 'dashboard');
  // Collapsible category groups
  const sectionGroups = useMemo(() => NAV_GROUPS.filter((g) => g.label && g.id !== 'dashboard'), []);

  // Determine which section is currently active by pathname
  const activeSectionId = useMemo(() => {
    for (const group of sectionGroups) {
      const isMatch = group.items.some((item) => {
        const matches = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return matches && !(item.label === 'Manage Tournaments' && pathname.startsWith(`${item.to}/new`));
      });
      if (isMatch) return group.id || group.label || '';
    }
    return '';
  }, [pathname, sectionGroups]);

  // Section open/closed state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default open: freefire and active section
    const initial: Record<string, boolean> = {
      freefire: true,
      blastx: true,
      competition: true,
    };
    return initial;
  });

  // Ensure active section is automatically opened when route changes
  useEffect(() => {
    if (activeSectionId) {
      setOpenSections((prev) => {
        if (prev[activeSectionId]) return prev;
        const next = { ...prev, [activeSectionId]: true };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, [activeSectionId]);

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const badgeCount = (badge?: NavBadge): number => {
    if (!badge || !stats.data) return 0;
    if (badge === 'live') return stats.data.tournaments.live;
    if (badge === 'pendingProofs') return stats.data.proofs.pending;
    return 0;
  };

  // Group total badge count (e.g. for section header indicator)
  const groupBadgeCount = (group: NavGroup): number => {
    return group.items.reduce((acc, item) => acc + badgeCount(item.badge), 0);
  };

  // Filter sections based on search query
  const q = searchQuery.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!q) {
      return sectionGroups.map((g) => ({
        group: g,
        items: g.items,
        matchesQuery: true,
      }));
    }

    return sectionGroups
      .map((g) => {
        const groupLabelMatches = g.label?.toLowerCase().includes(q);
        const matchingItems = g.items.filter(
          (item) => groupLabelMatches || item.label.toLowerCase().includes(q) || item.to.toLowerCase().includes(q)
        );
        return {
          group: g,
          items: matchingItems,
          matchesQuery: matchingItems.length > 0,
        };
      })
      .filter((entry) => entry.matchesQuery);
  }, [sectionGroups, q]);

  const dashboardMatches = useMemo(() => {
    if (!q) return true;
    return 'dashboard'.includes(q) || 'home'.includes(q);
  }, [q]);

  const totalResultsCount = (dashboardMatches && dashboardGroup ? 1 : 0) +
    filteredSections.reduce((acc, curr) => acc + curr.items.length, 0);

  return (
    <div className="flex h-full flex-col bg-background-elevated/95 backdrop-blur-xl border-r border-white/[0.08] select-none">
      {/* Brand Header */}
      <div className="relative flex h-16 items-center justify-between gap-2 border-b border-white/[0.08] px-4 overflow-hidden shrink-0">
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-16 bg-primary/10 blur-xl" />

        <div className="flex items-center min-w-0">
          <img
            src="/logo.png"
            alt="BlastiX Arena"
            className="h-8 w-auto object-contain drop-shadow-[0_0_14px_rgba(17,251,190,0.4)]"
          />
        </div>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-foreground-muted hover:text-primary hover:bg-surface-2/80 shrink-0"
            title="Hide sidebar (Ctrl+B)"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Global Sidebar Search */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/[0.06]">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search navigation... (Ctrl+K)"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-surface-2/70 border border-white/10 text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-display"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/10 pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>
        {searchQuery && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 px-1">
            <span>{totalResultsCount} page{totalResultsCount === 1 ? '' : 's'} found</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-3" aria-label="Primary">
        {/* Pinned Dashboard Link */}
        {dashboardGroup && dashboardMatches && (
          <div className="mb-2">
            {dashboardGroup.items.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                count={0}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* Collapsible Sections */}
        {filteredSections.map(({ group, items }) => {
          const sectionId = group.id || group.label || '';
          // When searching, force open so user immediately sees results
          const isOpen = q ? true : !!openSections[sectionId];
          const GroupIcon = group.icon || (group.accent === 'freefire' ? Flame : group.accent === 'blastx' ? Zap : null);
          const hasActiveChild = items.some((item) => {
            const matches = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return matches && !(item.label === 'Manage Tournaments' && pathname.startsWith(`${item.to}/new`));
          });
          const badgeTotal = groupBadgeCount(group);

          const groupTone =
            group.accent === 'freefire'
              ? hasActiveChild
                ? 'border-amber-300/35 bg-amber-400/[0.08] shadow-[0_0_14px_rgba(251,191,36,0.06)]'
                : 'border-amber-300/15 bg-amber-400/[0.025] hover:border-amber-300/25'
              : group.accent === 'blastx'
              ? hasActiveChild
                ? 'border-primary/35 bg-primary/[0.08] shadow-[0_0_14px_rgba(17,251,190,0.06)]'
                : 'border-primary/15 bg-primary/[0.025] hover:border-primary/25'
              : hasActiveChild
              ? 'border-white/15 bg-white/[0.04]'
              : 'border-white/5 bg-transparent hover:border-white/10';

          const headingTone =
            group.accent === 'freefire'
              ? 'text-amber-200'
              : group.accent === 'blastx'
              ? 'text-primary'
              : hasActiveChild
              ? 'text-white'
              : 'text-zinc-400 group-hover:text-zinc-200';

          return (
            <div
              key={sectionId}
              className={cn(
                'rounded-xl border transition-all duration-200 overflow-hidden',
                groupTone
              )}
            >
              {/* Collapsible Section Header Trigger */}
              <button
                type="button"
                onClick={() => toggleSection(sectionId)}
                className="group flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {GroupIcon && (
                    <GroupIcon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        group.accent === 'freefire'
                          ? 'text-amber-400'
                          : group.accent === 'blastx'
                          ? 'text-primary'
                          : hasActiveChild
                          ? 'text-primary'
                          : 'text-zinc-400 group-hover:text-zinc-300'
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider truncate font-display',
                      headingTone
                    )}
                  >
                    {group.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {/* Indicator if collapsed and has active child */}
                  {!isOpen && hasActiveChild && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(17,251,190,0.8)]" />
                  )}

                  {/* Indicator badge if items have notifications/live */}
                  {badgeTotal > 0 && (
                    <span
                      className={cn(
                        'inline-flex min-w-[16px] h-4 items-center justify-center rounded-full px-1 text-[9px] font-bold',
                        group.accent === 'freefire'
                          ? 'bg-amber-400 text-black'
                          : 'bg-primary text-black'
                      )}
                    >
                      {badgeTotal}
                    </span>
                  )}

                  {/* Smooth rotating Chevron */}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-zinc-400 transition-transform duration-300',
                      isOpen ? 'rotate-0 text-white' : '-rotate-90 text-zinc-500'
                    )}
                    aria-hidden="true"
                  />
                </div>
              </button>

              {/* Animated Expandable Dropdown Content using CSS Grid trick */}
              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-1 pb-1.5 space-y-0.5 border-t border-white/[0.04] pt-1">
                    {items.map((item) => (
                      <SidebarLink
                        key={item.to}
                        item={item}
                        count={badgeCount(item.badge)}
                        accent={group.accent}
                        pathname={pathname}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State when search has no matches */}
        {filteredSections.length === 0 && (!dashboardMatches || !dashboardGroup) && (
          <div className="px-3 py-8 text-center text-xs text-zinc-400 space-y-2">
            <p>
              No pages match <span className="text-primary font-medium">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-primary hover:underline block mx-auto"
            >
              Clear search
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}

export { Sidebar };
