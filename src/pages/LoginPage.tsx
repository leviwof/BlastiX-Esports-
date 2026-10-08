import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { GlowCard } from '@/components/shared/GlowCard';
import { AuthSplash } from '@/components/shared/AuthSplash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/apiError';
import { useAuthStatus } from '@/features/auth/auth.store';
import { useAdminPasswordLogin } from '@/features/auth/auth.hooks';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Admin sign-in using the server-configured admin email and password. */
function LoginPage() {
  const status = useAuthStatus();
  const location = useLocation();
  const loginMutation = useAdminPasswordLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  if (status === 'initializing') return <AuthSplash />;
  if (status === 'authenticated') return <Navigate to={from} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const isEmailValid = EMAIL_RE.test(trimmedEmail);
    const isPasswordValid = password.length > 0;
    setEmailError(isEmailValid ? null : 'Enter a valid admin email address.');
    setPasswordError(isPasswordValid ? null : 'Enter your admin password.');
    if (!isEmailValid || !isPasswordValid) return;

    loginMutation.mutate(
      { email: trimmedEmail, password },
      { onError: (err) => toast.error(getErrorMessage(err)) },
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <GlowCard className="w-full max-w-md p-8 border-white/10 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="BlastiX Arena"
            className="h-12 w-auto object-contain"
          />
          <h1 className="mt-4 font-display text-lg font-bold tracking-wide text-foreground">
            Admin Sign In
          </h1>
          <p className="mt-1.5 text-xs text-foreground-muted">
            Sign in with your admin email and password.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit} aria-label="Admin sign in" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground-soft">
              Admin email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="admin@blastixesports.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
            </div>
            {emailError && (
              <p id="email-error" role="alert" className="text-xs text-danger">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground-soft">
              Password
            </label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                aria-hidden="true"
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
            </div>
            {passwordError && (
              <p id="password-error" role="alert" className="text-xs text-danger">
                {passwordError}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-foreground-muted/70">
          Admin access only.
        </p>
      </GlowCard>
    </main>
  );
}

export { LoginPage };
