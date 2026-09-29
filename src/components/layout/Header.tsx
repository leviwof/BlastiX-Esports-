import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, PanelLeft, PanelLeftClose, Plus, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdmin } from '@/features/auth/auth.store';
import { cn, getInitials } from '@/lib/utils';

export interface HeaderProps {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onLogout?: () => void;
}

function Header({ onMenuClick, onToggleSidebar, sidebarOpen = true, onLogout }: HeaderProps) {
  const admin = useAdmin();
  const name = admin?.name ?? 'Admin';
  const initials = admin ? getInitials(admin.name) : 'AD';
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl/⌘-K focuses the global search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-background-elevated/85 px-4 backdrop-blur-xl sm:px-6">
      {/* Sidebar toggle button (works on desktop and mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="text-foreground-muted hover:text-primary hover:bg-surface-2 transition-colors shrink-0"
        aria-label={sidebarOpen ? 'Hide sidebar (Ctrl+B)' : 'Show sidebar (Ctrl+B)'}
        title={sidebarOpen ? 'Hide sidebar (Ctrl+B)' : 'Show sidebar (Ctrl+B)'}
        onClick={onToggleSidebar ?? onMenuClick}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeft className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(17,251,190,0.6)]" />
        )}
      </Button>

      {/* Mobile logo emblem or desktop emblem when sidebar is hidden */}
      <div className={cn('items-center gap-2', sidebarOpen ? 'flex lg:hidden' : 'flex')}>
        <img
          src="/logo-mark.png"
          alt="BlastiX Esports"
          className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(17,251,190,0.5)]"
        />
        {!sidebarOpen && (
          <span className="hidden sm:inline font-display text-xs font-black uppercase tracking-wider text-primary">
            BlastiX Esports
          </span>
        )}
      </div>

      {/* Global search with gaming bezel */}
      <div className="relative hidden max-w-md flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-primary/70" aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search tournaments, users, teams…"
          aria-label="Search"
          className="h-9 w-full rounded-md border border-white/10 bg-surface/70 pl-9 pr-14 text-sm text-foreground placeholder:text-foreground-muted/70 transition-all hover:border-primary/40 focus-visible:border-primary focus-visible:shadow-[0_0_16px_rgba(17,251,190,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded border border-white/10 bg-surface-2/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted md:inline-flex">
          Ctrl K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          asChild
          size="sm"
          className="bg-primary text-background font-semibold hover:bg-primary/90 hover:shadow-glow-md transition-all duration-200"
        >
          <Link to="/tournaments/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline font-display tracking-wide uppercase text-xs">New Tournament</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-[10px] px-1.5 py-1 transition-colors hover:bg-surface-2/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile menu"
            >
              <Avatar className="h-8 w-8">
                {admin?.avatarUrl && <AvatarImage src={admin.avatarUrl} alt={name} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden h-4 w-4 text-foreground-muted sm:block" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-medium text-foreground-soft">{name}</span>
              <span className="block truncate text-xs font-normal text-foreground-muted">
                {admin?.email ?? 'Not signed in'}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => onLogout?.()}>
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { Header };
