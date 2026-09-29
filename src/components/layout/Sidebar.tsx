import { NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { NAV_GROUPS, type NavBadge, type NavItem } from '@/config/nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/features/auth/auth.store';
import { useStats } from '@/features/stats/stats.hooks';

export interface SidebarProps {
  /** 'desktop' collapses to an icon rail between lg and xl; 'drawer' always shows labels. */
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
  onLogout?: () => void;
  onToggleCollapse?: () => void;
}

/** One grouped, badge-aware navigation link. */
function SidebarLink({
  item,
  count,
  rail,
  labelClass,
  onNavigate,
}: {
  item: NavItem;
  count: number;
  rail: boolean;
  labelClass: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isLiveBadge = item.badge === 'live';

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-all duration-150',
          rail && 'justify-center xl:justify-start',
          isActive
            ? 'bg-primary/15 text-primary border border-primary/35 shadow-[0_0_16px_rgba(17,251,190,0.18)] font-semibold'
            : 'text-foreground-muted hover:bg-surface-2/60 hover:text-foreground hover:border-white/5 border border-transparent',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active side indicator */}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary shadow-[0_0_8px_rgba(17,251,190,0.8)]"
            />
          )}

          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105',
              isActive ? 'text-primary drop-shadow-[0_0_6px_rgba(17,251,190,0.5)]' : 'text-foreground-muted group-hover:text-foreground-soft',
            )}
            aria-hidden="true"
          />
          <span className={cn('truncate font-display tracking-wide', labelClass)}>{item.label}</span>
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

function Sidebar({ variant = 'desktop', onNavigate, onLogout, onToggleCollapse }: SidebarProps) {
  const rail = variant === 'desktop';
  const labelClass = rail ? 'hidden xl:inline' : 'inline';
  const groupLabelClass = rail ? 'hidden xl:block' : 'block';
  const admin = useAdmin();
  const stats = useStats();
  const name = admin?.name ?? 'Admin';
  const initials = admin ? getInitials(admin.name) : 'AD';

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
          alt="BlastiX Esports"
          className={cn(
            'h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(17,251,190,0.45)] transition-transform hover:scale-105',
            rail ? 'block xl:hidden' : 'hidden',
          )}
        />
        {/* Full wordmark — when the sidebar is expanded */}
        <div className={cn('flex items-center gap-2 min-w-0', rail ? 'hidden xl:flex' : 'flex')}>
          <img
            src="/logo.png"
            alt="BlastiX Esports"
            className="h-8 w-auto object-contain drop-shadow-[0_0_14px_rgba(17,251,190,0.4)]"
          />
          <span className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-primary uppercase">
            HUB
          </span>
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
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? `group-${gi}`} className="space-y-1">
            {group.label && (
              <p className={cn('px-3 pb-1 text-xs font-medium text-foreground-muted/70', groupLabelClass)}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                count={badgeCount(item.badge)}
                rail={rail}
                labelClass={labelClass}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / admin profile */}
      <div className="mt-auto border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
          <Avatar className="h-8 w-8">
            {admin?.avatarUrl && <AvatarImage src={admin.avatarUrl} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', labelClass)}>
            <p className="truncate text-sm font-medium text-foreground-soft">{name}</p>
            <p className="truncate text-xs text-foreground-muted">{admin?.email ?? 'Not signed in'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          aria-label="Log out"
          className={cn('mt-1 w-full gap-3 text-foreground-muted', rail ? 'justify-center xl:justify-start' : 'justify-start')}
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className={labelClass}>Logout</span>
        </Button>
      </div>
    </div>
  );
}

export { Sidebar };
