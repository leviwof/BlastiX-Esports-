import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Pagination } from '@/components/ui/Pagination';
import { useApproveProof, useProofs } from '@/features/proofs/proofs.hooks';
import { ProofsTable } from '@/features/proofs/components/ProofsTable';
import { RejectProofDialog } from '@/features/proofs/components/RejectProofDialog';
import { ProofVideoModal } from '@/features/proofs/components/ProofVideoModal';
import type { Proof, ProofStatus } from '@/features/proofs/proofs.types';

const PAGE_SIZE = 20;

/** Review tabs — an `undefined` status ("All") sends no server-side filter. */
const PROOF_TABS: (TabItem & { status?: ProofStatus })[] = [
  { value: 'PROOF_SUBMITTED', label: 'Pending Review', status: 'PROOF_SUBMITTED' },
  { value: 'COMPLETED', label: 'Approved', status: 'COMPLETED' },
  { value: 'PROOF_REJECTED', label: 'Rejected', status: 'PROOF_REJECTED' },
  { value: 'ALL', label: 'All' },
];

/**
 * Proof verification queue. Defaults to the pending `PROOF_SUBMITTED` tab;
 * approving grants the reward (confirmed via dialog), rejecting requires a
 * reason (see `RejectProofDialog`). "Watch Video" streams the submitted
 * recording in an embedded player. Approve / reject are only offered on
 * pending submissions.
 */
function ProofsPage() {
  const [tab, setTab] = useState('PROOF_SUBMITTED');
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<Proof | null>(null);
  const [rejecting, setRejecting] = useState<Proof | null>(null);
  const [watching, setWatching] = useState<Proof | null>(null);

  const status = PROOF_TABS.find((t) => t.value === tab)?.status;

  const { data, isPending, isError, error, refetch, isFetching } = useProofs({
    page,
    limit: PAGE_SIZE,
    status,
  });
  const approve = useApproveProof();

  const changeTab = (next: string) => {
    setTab(next);
    setPage(1);
  };

  const confirmApprove = () => {
    if (!approving) return;
    approve.mutate(approving.id, { onSuccess: () => setApproving(null) });
  };

  return (
    <div>
      <PageHeader
        title="Proof verification"
        description="Review challenge proofs submitted by players."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Proofs' }]}
      />

      <div className="space-y-4">
        <Tabs tabs={PROOF_TABS} value={tab} onChange={changeTab} />

        <SectionCard contentClassName="p-0">
          {isPending ? (
            <LoadingState label="Loading proofs…" />
          ) : isError ? (
            <ErrorState title="Couldn't load proofs" error={error} onRetry={() => void refetch()} />
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nothing to review"
              description={
                tab === 'PROOF_SUBMITTED'
                  ? 'No proofs are waiting for review right now.'
                  : tab === 'ALL'
                    ? 'No proofs have been submitted yet.'
                    : 'No proofs with this status.'
              }
            />
          ) : (
            <>
              <ProofsTable
                proofs={data.items}
                onApprove={(p) => setApproving(p)}
                onReject={(p) => setRejecting(p)}
                onWatch={(p) => setWatching(p)}
                busyId={approve.isPending ? approve.variables ?? null : null}
              />
              <Pagination
                page={page}
                limit={PAGE_SIZE}
                total={data.total}
                onPageChange={setPage}
                disabled={isFetching}
                className="px-5 pb-4"
              />
            </>
          )}
        </SectionCard>
      </div>

      <ConfirmDialog
        open={approving !== null}
        title="Approve proof"
        description={
          approving
            ? `Approve ${approving.user.name}'s proof for "${approving.challenge.title}"? This grants ${approving.challenge.reward_xp.toLocaleString()} XP.`
            : undefined
        }
        confirmLabel="Approve proof"
        loading={approve.isPending}
        onConfirm={confirmApprove}
        onClose={() => setApproving(null)}
      />

      <RejectProofDialog proof={rejecting} onClose={() => setRejecting(null)} />

      <ProofVideoModal proof={watching} onClose={() => setWatching(null)} />
    </div>
  );
}

export { ProofsPage };
