import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { ProofsPage } from '@/pages/ProofsPage';
import type { Proof, ProofPage } from '@/features/proofs/proofs.types';
import { approveProof, listProofs, rejectProof } from '@/features/proofs/proofs.api';

// Network is mocked; toasts are stubbed so mutation feedback needs no Toaster.
vi.mock('@/features/proofs/proofs.api');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderAt(routes: RouteObject[], path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const now = '2026-10-01T10:00:00.000Z';

// A pending submission — the only status that offers approve / reject actions.
const proof: Proof = {
  id: 'pr1',
  proof_url: 'https://drive.google.com/file/d/drive-file-123/preview',
  status: 'PROOF_SUBMITTED',
  current_progress: 1,
  submitted_at: now,
  user: { id: 'u2', name: 'Player One', email: 'p1@example.com' },
  challenge: { id: 'c1', title: 'Win a match', reward_xp: 100 },
};
function pageOf(items: Proof[]): ProofPage {
  return { items, page: 1, limit: 20, total: items.length };
}

const routes: RouteObject[] = [{ path: '/proofs', element: <ProofsPage /> }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('proof verification', () => {
  it('approves a proof via POST /admin/proofs/:id/approve after confirming', async () => {
    vi.mocked(listProofs).mockResolvedValue(pageOf([proof]));
    vi.mocked(approveProof).mockResolvedValue({ ...proof, status: 'COMPLETED' });
    renderAt(routes, '/proofs');

    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    expect(approveProof).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Approve proof' }));

    await waitFor(() => expect(approveProof).toHaveBeenCalledWith('pr1'));
  });

  it('rejects a proof with a reason via POST /admin/proofs/:id/reject', async () => {
    vi.mocked(listProofs).mockResolvedValue(pageOf([proof]));
    vi.mocked(rejectProof).mockResolvedValue({ ...proof, status: 'PROOF_REJECTED' });
    renderAt(routes, '/proofs');

    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/reason/i), {
      target: { value: 'The recording is blurry.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reject proof' }));

    await waitFor(() =>
      expect(rejectProof).toHaveBeenCalledWith('pr1', { reason: 'The recording is blurry.' }),
    );
  });

  it('refetches with the selected status when a tab is clicked', async () => {
    vi.mocked(listProofs).mockResolvedValue(pageOf([proof]));
    renderAt(routes, '/proofs');

    // Default tab is the pending review queue.
    await waitFor(() =>
      expect(listProofs).toHaveBeenCalledWith(expect.objectContaining({ status: 'PROOF_SUBMITTED' })),
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Approved' }));

    await waitFor(() =>
      expect(listProofs).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'COMPLETED', page: 1 }),
      ),
    );
  });

  it('plays Google Drive proofs in a native player using the source aspect ratio', async () => {
    vi.mocked(listProofs).mockResolvedValue(pageOf([proof]));
    renderAt(routes, '/proofs');

    fireEvent.click(await screen.findByRole('button', { name: 'Watch Video' }));

    const video = await screen.findByTitle('Proof recording');
    expect(video.tagName).toBe('VIDEO');
    expect(video.getAttribute('src')).toBe(
      'https://drive.google.com/uc?export=download&id=drive-file-123',
    );
    expect(video.className).toContain('object-contain');
    expect(
      screen.getByRole('link', { name: /open in/i }).getAttribute('href'),
    ).toBe(proof.proof_url);
  });

  it('falls back to the Drive embed if native video playback fails', async () => {
    const driveProof = {
      ...proof,
      proof_url: 'https://drive.google.com/file/d/drive-file-123/preview',
    };
    vi.mocked(listProofs).mockResolvedValue(pageOf([driveProof]));
    renderAt(routes, '/proofs');

    fireEvent.click(await screen.findByRole('button', { name: 'Watch Video' }));
    fireEvent.error(await screen.findByTitle('Proof recording'));

    const frame = await screen.findByTitle('Proof recording');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(driveProof.proof_url);
  });

  it('keeps embedding non-Drive proof URLs', async () => {
    const externalProof = { ...proof, proof_url: 'https://example.com/proof.mp4' };
    vi.mocked(listProofs).mockResolvedValue(pageOf([externalProof]));
    renderAt(routes, '/proofs');

    fireEvent.click(await screen.findByRole('button', { name: 'Watch Video' }));

    const frame = await screen.findByTitle('Proof recording');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(externalProof.proof_url);
  });
});
