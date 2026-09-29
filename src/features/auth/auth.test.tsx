import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AxiosError } from 'axios';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoginPage } from '@/pages/LoginPage';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import { useLogout } from '@/features/auth/auth.hooks';
import { useAuthStore } from '@/features/auth/auth.store';
import type { AdminUser, UserResponse } from '@/features/auth/auth.types';
import { routes } from '@/app/router';
import {
  clearToken,
  getToken,
  handleError,
  setToken,
  setUnauthorizedHandler,
} from '@/lib/apiClient';
import { ApiError } from '@/lib/apiError';
import { sendOtp, login, getMe } from '@/features/auth/auth.api';

vi.mock('@/features/auth/auth.api');

// The dashboard (rendered on some authenticated routes) reads the tournaments
// list; keep it offline with an empty page so these auth tests stay hermetic.
vi.mock('@/features/tournaments/tournaments.api', () => ({
  getTournaments: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
}));

const ADMIN_EMAIL = 'admin@blastixesports.com';

const adminUser: UserResponse = {
  id: 'u1',
  name: 'Site Admin',
  email: ADMIN_EMAIL,
  role: 'ADMIN',
  profile_pic: null,
  is_active: true,
  token: 'jwt_admin',
};

const playerUser: UserResponse = { ...adminUser, role: 'PLAYER', token: 'jwt_player' };

const adminIdentity: AdminUser = {
  id: 'u1',
  name: 'Site Admin',
  email: ADMIN_EMAIL,
  role: 'ADMIN',
  avatarUrl: null,
};

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Render a component with just the providers its hooks need (no AuthBootstrap). */
function renderWithProviders(ui: ReactNode) {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Render the real route tree at a path; the store is seeded per test. */
function renderRoutesAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

async function advanceToOtpStep() {
  vi.mocked(sendOtp).mockResolvedValue(undefined);
  renderWithProviders(<LoginPage />);
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: ADMIN_EMAIL } });
  fireEvent.click(screen.getByRole('button', { name: /send login code/i }));
  // Exact match: the form's aria-label ("Enter login code") also matches /login code/i.
  return screen.findByLabelText('Login code');
}

beforeEach(() => {
  clearToken();
  setUnauthorizedHandler(null);
  useAuthStore.setState({ status: 'unauthenticated', admin: null });
  vi.clearAllMocks();
});

describe('admin authentication', () => {
  it('renders the login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send login code/i })).toBeTruthy();
  });

  it('validates the email before requesting a code', () => {
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /send login code/i }));
    expect(screen.getByText(/valid email/i)).toBeTruthy();
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it('validates the OTP before attempting login', async () => {
    const otpInput = await advanceToOtpStep();
    fireEvent.change(otpInput, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));
    expect(screen.getByText(/code from your email/i)).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  // __MORE__

  it('signs in an admin after a valid code and stores the session', async () => {
    vi.mocked(login).mockResolvedValue(adminUser);
    const otpInput = await advanceToOtpStep();
    fireEvent.change(otpInput, { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));

    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'));
    expect(useAuthStore.getState().admin?.email).toBe(ADMIN_EMAIL);
    expect(getToken()).toBe('jwt_admin');
    expect(login).toHaveBeenCalledWith({ email: ADMIN_EMAIL, otp: '654321' });
  });

  it('keeps the user signed out and stores nothing on an invalid code', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError('Invalid or expired code.', { status: 400 }));
    const otpInput = await advanceToOtpStep();
    fireEvent.change(otpInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(getToken()).toBeNull();
  });

  it('denies a non-admin even with a valid code', async () => {
    vi.mocked(login).mockResolvedValue(playerUser);
    const otpInput = await advanceToOtpStep();
    fireEvent.change(otpInput, { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(getToken()).toBeNull();
  });

  // __MORE2__

  it('renders the dashboard for an authenticated admin', async () => {
    useAuthStore.setState({ status: 'authenticated', admin: adminIdentity });
    renderRoutesAt('/dashboard');
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeTruthy();
  });

  it('redirects an unauthenticated visitor from a protected route to /login', async () => {
    useAuthStore.setState({ status: 'unauthenticated', admin: null });
    renderRoutesAt('/dashboard');
    expect(await screen.findByRole('button', { name: /send login code/i })).toBeTruthy();
  });

  it('sends an already-authenticated admin away from /login', async () => {
    useAuthStore.setState({ status: 'authenticated', admin: adminIdentity });
    renderRoutesAt('/login');
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeTruthy();
  });

  // __MORE3__

  it('restores an admin session from a stored token', async () => {
    setToken('jwt_admin');
    vi.mocked(getMe).mockResolvedValue(adminUser);
    useAuthStore.setState({ status: 'initializing', admin: null });
    render(<AuthBootstrap />);
    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'));
    expect(useAuthStore.getState().admin?.email).toBe(ADMIN_EMAIL);
  });

  it('clears an invalid session on bootstrap', async () => {
    setToken('stale');
    vi.mocked(getMe).mockRejectedValue(new ApiError('Your session has expired.', { status: 401 }));
    useAuthStore.setState({ status: 'initializing', admin: null });
    render(<AuthBootstrap />);
    await waitFor(() => expect(useAuthStore.getState().status).toBe('unauthenticated'));
    expect(getToken()).toBeNull();
  });

  it('clears a non-admin session on bootstrap', async () => {
    setToken('jwt_player');
    vi.mocked(getMe).mockResolvedValue(playerUser);
    useAuthStore.setState({ status: 'initializing', admin: null });
    render(<AuthBootstrap />);
    await waitFor(() => expect(useAuthStore.getState().status).toBe('unauthenticated'));
    expect(getToken()).toBeNull();
  });

  it('resolves to unauthenticated when no token is stored', async () => {
    useAuthStore.setState({ status: 'initializing', admin: null });
    render(<AuthBootstrap />);
    await waitFor(() => expect(useAuthStore.getState().status).toBe('unauthenticated'));
    expect(getMe).not.toHaveBeenCalled();
  });

  // __MORE4__

  it('logs out: clears the token and resets the store', () => {
    setToken('jwt_admin');
    useAuthStore.setState({ status: 'authenticated', admin: adminIdentity });
    const client = makeClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => result.current());

    expect(getToken()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().admin).toBeNull();
  });

  it('clears the token and notifies the handler on a 401', async () => {
    setToken('jwt_admin');
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    const err = {
      response: { status: 401, data: { status: 'error', message: 'Your session has expired.' } },
      isAxiosError: true,
    } as AxiosError;

    await expect(handleError(err)).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not treat a non-401 error as an auth failure', async () => {
    setToken('jwt_admin');
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    const err = {
      response: { status: 500, data: { status: 'error', message: 'Server error' } },
      isAxiosError: true,
    } as AxiosError;

    await expect(handleError(err)).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBe('jwt_admin');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
