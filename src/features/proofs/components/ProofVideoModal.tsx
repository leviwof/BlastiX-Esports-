import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatEnum } from '@/lib/format';
import { env } from '@/lib/env';
import { getToken } from '@/lib/apiClient';
import type { Proof } from '../proofs.types';

export interface ProofVideoModalProps {
  /** The proof whose recording to preview; the modal is open while this is set. */
  proof: Proof | null;
  onClose: () => void;
}

function getFileId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([^/?]+)/) || url.match(/\/file\/d\/([^/?]+)/) || url.match(/id=([^&]+)/);
  return match ? match[1] : null;
}

function statusVariant(status: string): 'warning' | 'danger' | 'success' | 'default' | 'secondary' {
  switch (status) {
    case 'PROOF_SUBMITTED':
      return 'warning';
    case 'PROOF_REJECTED':
      return 'danger';
    case 'COMPLETED':
      return 'success';
    case 'CLAIMED':
      return 'default';
    default:
      return 'secondary';
  }
}

export interface ProofRoundItem {
  round: string;
  url: string;
}

function parseProofRounds(proofUrl: string | null): ProofRoundItem[] {
  if (!proofUrl) return [];
  try {
    const parsed = JSON.parse(proofUrl);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((item, idx) => ({
          round: item.round || item.title || item.name || `Round ${idx + 1}`,
          url: item.url || item.link || '',
        }))
        .filter((item) => Boolean(item.url));
    }
  } catch {
    // Single string URL fallback
  }
  return [{ round: 'Round 1', url: proofUrl }];
}

/**
 * Play Google Drive recordings using a native video tag streamed through the backend
 * to preserve aspect ratio, enable seeking, and support custom styling.
 */
function ProofVideoModal({ proof, onClose }: ProofVideoModalProps) {
  const rounds = parseProofRounds(proof?.proof_url ?? null);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);

  useEffect(() => {
    setUseDriveEmbed(false);
    setSelectedRoundIndex(0);
  }, [proof?.proof_url]);

  const activeRound = rounds[selectedRoundIndex] || rounds[0] || null;
  const url = activeRound?.url ?? null;
  const isDrive = url ? /drive\.google\.com/i.test(url) : false;
  const driveFileId = isDrive ? getFileId(url) : null;

  const token = getToken();
  const apiBase = env.apiBaseUrl ? env.apiBaseUrl.replace(/\/+$/, '') : '';
  const streamUrl = driveFileId
    ? `${apiBase}/v1/proofs/stream/${driveFileId}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : null;

  const [useDriveEmbed, setUseDriveEmbed] = useState(false);

  return (
    <Modal
      open={Boolean(proof)}
      onClose={onClose}
      title="Proof recording"
      description={
        proof
          ? `${proof.user.name} — "${proof.challenge.title}"${
              rounds.length > 1 ? ` (${activeRound?.round || ''})` : ''
            }`
          : undefined
      }
      className="max-w-4xl"
      footer={
        url ? (
          <Button asChild variant="outline">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {isDrive ? 'Open in Google Drive' : 'Open in new tab'}
            </a>
          </Button>
        ) : undefined
      }
    >
      {rounds.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-surface/30 p-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Rounds ({rounds.length}):
          </span>
          {rounds.map((r, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={selectedRoundIndex === idx ? 'default' : 'outline'}
              onClick={() => {
                setUseDriveEmbed(false);
                setSelectedRoundIndex(idx);
              }}
              className="h-7 px-3 text-xs font-medium"
            >
              {r.round}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex w-full items-center justify-center rounded-xl border border-border bg-black lg:w-[360px] shrink-0 overflow-hidden min-h-[200px]">
          {url && streamUrl && !useDriveEmbed ? (
            <video
              key={streamUrl}
              src={streamUrl}
              title="Proof recording"
              controls
              playsInline
              preload="metadata"
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
              onError={() => setUseDriveEmbed(true)}
            >
              Your browser cannot play this recording.
            </video>
          ) : url ? (
            <iframe
              src={url}
              title="Proof recording"
              className="max-h-[70vh] w-full aspect-video rounded-xl border border-border bg-black"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <p className="rounded-xl border border-border bg-surface/50 p-6 text-center text-sm text-foreground-muted">
              No recording was attached to this submission.
            </p>
          )}
        </div>

        {proof && (
          <div className="flex-1 space-y-4 rounded-xl border border-border/60 bg-surface/30 p-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Player</h3>
              <p className="mt-1 font-medium text-foreground">{proof.user.name}</p>
              <p className="text-xs text-foreground-muted">{proof.user.email}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Challenge</h3>
              <p className="mt-1 font-medium text-foreground">{proof.challenge.title}</p>
              <p className="text-xs text-foreground-muted">{proof.challenge.reward_xp.toLocaleString()} XP Reward</p>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status</h3>
                <div className="mt-1">
                  <Badge variant={statusVariant(proof.status)}>{formatEnum(proof.status)}</Badge>
                </div>
              </div>

              {proof.submitted_at && (
                <div className="text-right">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Submitted</h3>
                  <p className="mt-1 text-xs text-foreground">{formatDateTime(proof.submitted_at)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export { ProofVideoModal };
