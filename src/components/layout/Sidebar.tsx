import { NavLink, useLocation } from 'react-router-dom';
import { Flame, PanelLeftClose, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS, type NavBadge, type NavGroup, type NavItem } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { useStats } from '@/features/stats/stats.hooks';

export interface SidebarProps {
  /** 'desktop' collapses to an icon rail between lg and xl; 'drawer' always shows labels. */
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

/** One grouped, badge-aware navigation link. */
function SidebarLink({
  item,
  count,
  rail,
  labelClass,
  accent,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  count: number;
  rail: boolean;
  labelClass: string;
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
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          rail && 'justify-center xl:justify-start',
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
              className={cn('absolute left-0 top-2 bottom-2 w-1 rounded-r-full', activeIndicatorClass)}
            />
          )}

          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105',
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
          <span className={cn('truncate font-display tracking-wide', labelClass)}>{item.label}</span>
          {isFreeFireLive && (
            <span
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                isActive ? 'bg-amber-300/20 text-amber-100' : 'bg-white/[0.06] text-foreground-muted',
                rail ? 'hidden xl:inline-flex' : 'inline-flex',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Live
            </span>
          )}
          {count > 0 && (
            <span
              className={cn(
                'ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tracking-tight',
                rail ? 'hidden xl:inline-flex' : 'inline-flex',
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
          {count > 0 && rail && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute right-1 top-1 h-2 w-2 rounded-full xl:hidden',
                isLiveBadge ? 'bg-danger animate-live-pulse' : 'bg-primary shadow-[0_0_6px_rgba(17,251,190,0.7)]',
              )}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ variant = 'desktop', onNavigate, onToggleCollapse }: SidebarProps) {
  const { pathname } = useLocation();
  const rail = variant === 'desktop';
  const labelClass = rail ? 'hidden xl:inline' : 'inline';
  const groupLabelClass = rail ? 'hidden xl:block' : 'block';
  const stats = useStats();

  const badgeCount = (badge?: NavBadge): number => {
    if (!badge || !stats.data) return 0;
    if (badge === 'live') return stats.data.tournaments.live;
    if (badge === 'pendingProofs') return stats.data.proofs.pending;
    return 0;
  };

  return (
    <div className="flex h-full flex-col bg-background-elevated/95 backdrop-blur-xl border-r border-white/[0.08]">
      {/* Brand */}
      <div className="relative flex h-16 items-center justify-between gap-2 border-b border-white/[0.08] px-4 overflow-hidden">
        {/* Subtle top neon ambient glow */}
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-16 bg-primary/10 blur-xl" />

        {/* Compact emblem — fits the narrow icon rail */}
        <img
          src="/logo-mark.png"
          alt="BlastiX Arena"
          className={cn(
            'h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(17,251,190,0.45)] transition-transform hover:scale-105',
            rail ? 'block xl:hidden' : 'hidden',
          )}
        />
        {/* Full wordmark — when the sidebar is expanded */}
        <div className={cn('flex items-center min-w-0', rail ? 'hidden xl:flex' : 'flex')}>
          <img
            src="/logo.png"
            alt="BlastiX Arena"
            className="h-8 w-auto object-contain drop-shadow-[0_0_14px_rgba(17,251,190,0.4)]"
          />
        </div>

        {/* Hide/collapse sidebar button on desktop */}
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

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Primary">
        {NAV_GROUPS.map((group, gi) => {
          const activeGroup = group.items.some((item) => {
            const matches = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return matches && !(item.label === 'Manage Tournaments' && pathname.startsWith(`${item.to}/new`));
          });
          const GroupIcon = group.accent === 'freefire' ? Flame : group.accent === 'blastx' ? Zap : null;
          const groupTone =
            group.accent === 'freefire'
              ? activeGroup
                ? 'border-amber-300/30 bg-amber-400/[0.07]'
                : 'border-amber-300/10 bg-amber-400/[0.025]'
              : activeGroup
                ? 'border-primary/30 bg-primary/[0.06]'
                : 'border-primary/10 bg-primary/[0.02]';
          const headingTone =
            group.accent === 'freefire'
              ? 'text-amber-200/90'
              : group.accent === 'blastx'
                ? 'text-primary/90'
                : 'text-foreground-muted/70';

          return (
          <div
            key={group.label ?? `group-${gi}`}
            className={cn(
              'space-y-1',
              group.accent && 'rounded-xl border p-2 transition-colors',
              group.accent && groupTone,
            )}
          >
            {group.label && (
              <p className={cn('flex items-center gap-2 px-2.5 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-[0.16em]', groupLabelClass, headingTone)}>
                {GroupIcon && <GroupIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className={cn('truncate', group.accent === 'blastx' && 'normal-case tracking-[0.14em]')}>{group.label}</span>
                {group.accent && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                count={badgeCount(item.badge)}
                rail={rail}
                labelClass={labelClass}
                accent={group.accent}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
          );
        })}
      </nav>
    </div>
  );
}

export { Sidebar };
