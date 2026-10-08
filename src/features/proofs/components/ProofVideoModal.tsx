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

/**
 * Play Google Drive recordings using a native video tag streamed through the backend
 * to preserve aspect ratio, enable seeking, and support custom styling.
 */
function ProofVideoModal({ proof, onClose }: ProofVideoModalProps) {
  const url = proof?.proof_url ?? null;
  const isDrive = url ? /drive\.google\.com/i.test(url) : false;
  const driveFileId = isDrive ? getFileId(url) : null;

  const token = getToken();
  const apiBase = env.apiBaseUrl ? env.apiBaseUrl.replace(/\/+$/, '') : '';
  const streamUrl = driveFileId
    ? `${apiBase}/v1/proofs/stream/${driveFileId}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : null;

  const [useDriveEmbed, setUseDriveEmbed] = useState(false);

  useEffect(() => {
    setUseDriveEmbed(false);
  }, [url]);

  return (
    <Modal
      open={Boolean(proof)}
      onClose={onClose}
      title="Proof recording"
      description={proof ? `${proof.user.name} — "${proof.challenge.title}"` : undefined}
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
