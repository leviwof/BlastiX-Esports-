import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AppBackground } from '@/components/layout/AppBackground';
import { queryClient } from '@/lib/queryClient';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';

/**
 * Global app providers + the fixed atmospheric background and toaster.
 *
 * Hierarchy: QueryClientProvider (server state) → TooltipProvider → app.
 * AuthBootstrap runs session restoration once, on mount; it renders nothing.
 */
function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <AppBackground />
        <AuthBootstrap />
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export { Providers };
