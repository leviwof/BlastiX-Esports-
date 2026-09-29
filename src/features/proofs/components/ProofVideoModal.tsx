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
 * Plays a submitted proof recording in an embedded player. Proof URLs are
 * typically Google Drive `/preview` links (which stream in an <iframe>), but any
 * embeddable URL works; a direct external link is always offered as a fallback.
 */
function ProofVideoModal({ proof, onClose }: ProofVideoModalProps) {
  const url = proof?.proof_url ?? null;
  const isDrive = url ? /drive\.google\.com/i.test(url) : false;

  return (
    <Modal
      open={Boolean(proof)}
      onClose={onClose}
      title="Proof recording"
      description={proof ? `${proof.user.name} — "${proof.challenge.title}"` : undefined}
      className="max-w-3xl"
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
      {url ? (
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
