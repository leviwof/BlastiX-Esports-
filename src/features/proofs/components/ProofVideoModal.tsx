import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
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
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    setUseDriveEmbed(false);
    setAspectRatio(null);
  }, [url]);

  return (
    <Modal
      open={Boolean(proof)}
      onClose={onClose}
      title="Proof recording"
      description={proof ? `${proof.user.name} — "${proof.challenge.title}"` : undefined}
      className="max-w-6xl"
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
      {url && streamUrl && !useDriveEmbed ? (
        <div
          className="mx-auto flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-black"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : '16 / 9',
            maxHeight: '70vh',
          }}
        >
          <video
            key={streamUrl}
            src={streamUrl}
            title="Proof recording"
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget;
              if (videoWidth > 0 && videoHeight > 0) {
                setAspectRatio(videoWidth / videoHeight);
              }
            }}
            onError={() => setUseDriveEmbed(true)}
          >
            Your browser cannot play this recording.
          </video>
        </div>
      ) : url ? (
        <iframe
          src={url}
          title="Proof recording"
          className="aspect-video w-full rounded-xl border border-border bg-black"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <p className="rounded-xl border border-border bg-surface/50 p-6 text-center text-sm text-foreground-muted">
          No recording was attached to this submission.
        </p>
      )}
    </Modal>
  );
}

export { ProofVideoModal };
