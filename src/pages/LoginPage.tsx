import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { GlowCard } from '@/components/shared/GlowCard';
import { AuthSplash } from '@/components/shared/AuthSplash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/apiError';
import { useAuthStatus } from '@/features/auth/auth.store';
import { useLogin, useSendOtp } from '@/features/auth/auth.hooks';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

/**
 * Passwordless admin sign-in — the verified two-step email-OTP flow:
 *   1. enter email  → POST /auth/send-otp
 *   2. enter code   → POST /auth/login  (admin role gate happens in useLogin)
 * On success the auth store flips to `authenticated` and this screen redirects.
 * Already-authenticated visitors are bounced straight to the app.
 */
function LoginPage() {
  const status = useAuthStatus();
  const location = useLocation();
  const sendOtp = useSendOtp();
  const loginMutation = useLogin();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  // Don't flash the form while the session is still resolving / already signed in.
  if (status === 'initializing') return <AuthSplash />;
  if (status === 'authenticated') return <Navigate to={from} replace />;

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(null);
    sendOtp.mutate(trimmed, {
      onSuccess: () => {
        setStep('otp');
        setOtp('');
        setOtpError(null);
        toast.success('Login code sent. Check your email.');
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const submitOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!OTP_RE.test(otp)) {
      setOtpError('Enter the 6-digit code from your email.');
      return;
    }
    setOtpError(null);
    // Success flips the auth store → the guard above redirects to the app.
    loginMutation.mutate(
      { email: email.trim(), otp },
      { onError: (err) => toast.error(getErrorMessage(err)) },
    );
  };

  const resend = () => {
    sendOtp.mutate(email.trim(), {
      onSuccess: () => toast.success('A new code is on its way.'),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const backToEmail = () => {
    setStep('email');
    setOtp('');
    setOtpError(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <GlowCard className="w-full max-w-md p-8 border-white/10 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="BlastiX Esports"
            className="h-12 w-auto object-contain"
          />
          <h1 className="mt-4 font-display text-lg font-bold tracking-wide text-foreground">
            Admin Sign In
          </h1>
          <p className="mt-1.5 text-xs text-foreground-muted">
            {step === 'email'
              ? 'Enter your email to receive a login code.'
              : `Enter the 6-digit code sent to ${email.trim()}.`}
          </p>
        </div>

        {step === 'email' && (
          <form className="mt-6 space-y-4" onSubmit={submitEmail} aria-label="Admin sign in" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground-soft">
                Email
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
                  autoComplete="email"
                  placeholder="admin@gmail.com"
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

            <Button type="submit" className="w-full" size="lg" disabled={sendOtp.isPending}>
              {sendOtp.isPending ? 'Sending…' : 'Send login code'}
            </Button>
          </form>
        )}
        {step === 'otp' && (
          <form className="mt-6 space-y-4" onSubmit={submitOtp} aria-label="Enter login code" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-xs font-medium text-foreground-soft">
                Login code
              </label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                  aria-hidden="true"
                />
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  className="pl-9 tracking-[0.35em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? 'otp-error' : undefined}
                />
              </div>
              {otpError && (
                <p id="otp-error" role="alert" className="text-xs text-danger">
                  {otpError}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Verifying…' : 'Verify & sign in'}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={backToEmail}
                className="inline-flex items-center gap-1 text-foreground-muted transition-colors hover:text-foreground-soft"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Use a different email
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={sendOtp.isPending}
                className="text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-foreground-muted/70">
          Passwordless sign-in — a one-time code is emailed to admins.
        </p>
      </GlowCard>
    </main>
  );
}

export { LoginPage };
