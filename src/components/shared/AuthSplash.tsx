export interface AuthSplashProps {
  /** Status line shown under the brand. */
  label?: string;
}

/**
 * Full-screen themed loading state shown while the session is being resolved
 * (and during route transitions that await auth). Matches the BlastIX identity
 * so there's no unstyled flash before the app or login screen appears.
 */
function AuthSplash({ label = 'Restoring your session…' }: AuthSplashProps) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/logo.png" alt="BlastiX Esports" className="h-12 w-auto animate-pulse drop-shadow-[0_0_16px_rgba(17,251,190,0.5)]" />
        <p className="text-[11px] font-display font-bold uppercase tracking-[0.25em] text-primary/80">
          BlastiX Esports Hub
        </p>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-foreground-muted">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>
    </main>
  );
}

export { AuthSplash };
