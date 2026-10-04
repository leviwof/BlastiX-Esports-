import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import type { Proof } from '../proofs.types';

export interface ProofVideoModalProps {
  /** The proof whose recording to preview; the modal is open while this is set. */
  proof: Proof | null;
  onClose: () => void;
}

/**
 * Play public Google Drive recordings with the native video controls so their
 * source aspect ratio is preserved. Fall back to Drive's embed if direct playback
 * is unavailable for a particular file.
 */
function ProofVideoModal({ proof, onClose }: ProofVideoModalProps) {
  const url = proof?.proof_url ?? null;
  const isDrive = url ? /drive\.google\.com/i.test(url) : false;
  const driveFileId = url?.match(/\/file\/d\/([^/?]+)/)?.[1] ?? null;
  const directVideoUrl =
    driveFileId && isDrive
      ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveFileId)}`
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
      {url && directVideoUrl && !useDriveEmbed ? (
        <div
          className="mx-auto flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-black"
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : '16 / 9',
            maxHeight: '70vh',
          }}
        >
          <video
            key={url}
            src={directVideoUrl}
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
