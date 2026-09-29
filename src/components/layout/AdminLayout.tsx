import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLogout } from '@/features/auth/auth.hooks';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * App shell: collapsible desktop sidebar (toggleable via Header, Sidebar or Ctrl+B)
 * + sticky header + scrollable main + mobile drawer.
 */
function AdminLayout() {
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('blastix_sidebar_open');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const closeDrawer = useCallback(() => setMobileOpen(false), []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('blastix_sidebar_open', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, []);

  const handleLogout = useCallback(() => {
    setMobileOpen(false);
    logout();
  }, [logout]);

  // Close the mobile drawer on Escape; toggle sidebar on Ctrl/Cmd+B.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar with smooth slide in/out transition */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.08] lg:block w-[240px] transition-all duration-300 ease-in-out',
          sidebarOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <Sidebar variant="desktop" onLogout={handleLogout} onToggleCollapse={toggleSidebar} />
      </aside>

      {/* Content column, offsets smoothly when sidebar collapses or opens */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-[240px]' : 'lg:pl-0'
        )}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[240px] border-r border-white/[0.08] bg-background-elevated shadow-glow-strong">
            <Sidebar variant="drawer" onNavigate={closeDrawer} onLogout={handleLogout} />
          </div>
        </div>
      )}
    </div>
  );
}

export { AdminLayout };
