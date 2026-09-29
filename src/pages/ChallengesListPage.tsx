import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import {
  useChallenges,
  useCreateChallenge,
  useDeleteChallenge,
  useUpdateChallenge,
} from '@/features/challenges/challenges.hooks';
import {
  ChallengeFilters,
  emptyChallengeFilters,
  type ChallengeFilterState,
} from '@/features/challenges/components/ChallengeFilters';
import { ChallengesTable } from '@/features/challenges/components/ChallengesTable';
import { ChallengeForm } from '@/features/challenges/components/ChallengeForm';
import {
  challengeToFormValues,
  createChallengeDefaults,
  toCreatePayload,
  toUpdatePayload,
  type ChallengeFormValues,
} from '@/features/challenges/challenges.schema';
import type { Challenge } from '@/features/challenges/challenges.types';

const PAGE_SIZE = 20;

/**
 * Challenge management — create / edit in a modal, soft-disable via the row
 * toggle (`is_active:false`), or hard-delete behind a destructive confirm (a
 * hard delete cascades player progress). Changing a filter resets to page 1.
 */
function ChallengesListPage() {
  const [filters, setFilters] = useState<ChallengeFilterState>(emptyChallengeFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Challenge | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Challenge | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useChallenges({
    page,
    limit: PAGE_SIZE,
    type: filters.type || undefined,
    is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
  });

  const create = useCreateChallenge();
  const update = useUpdateChallenge();
  const remove = useDeleteChallenge();

  const changeFilters = (next: ChallengeFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const closeForm = () => setEditing(null);

  const submitForm = (values: ChallengeFormValues) => {
    if (editing === 'new') {
      create.mutate(toCreatePayload(values), { onSuccess: closeForm });
    } else if (editing) {
      update.mutate({ id: editing.id, body: toUpdatePayload(values) }, { onSuccess: closeForm });
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div>
      <PageHeader
        title="Challenges"
        description="Create and manage daily, weekly and special challenges."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Challenges' }]}
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" />
            New challenge
          </Button>
        }
      />

      <div className="space-y-4">
        <ChallengeFilters value={filters} onChange={changeFilters} />

        <SectionCard contentClassName="p-0">
          {isPending ? (
            <LoadingState label="Loading challenges…" />
          ) : isError ? (
            <ErrorState
              title="Couldn't load challenges"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : data.items.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No challenges yet"
              description="Create one to get players earning XP."
              action={
                <Button onClick={() => setEditing('new')}>
                  <Plus className="h-4 w-4" />
                  New challenge
                </Button>
              }
            />
          ) : (
            <>
              <ChallengesTable
                challenges={data.items}
                onEdit={(c) => setEditing(c)}
                onToggleActive={(c) => update.mutate({ id: c.id, body: { is_active: !c.is_active } })}
                onDelete={(c) => setDeleting(c)}
                busyId={update.isPending ? update.variables?.id ?? null : null}
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

      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing === 'new' ? 'New challenge' : 'Edit challenge'}
        className="max-w-2xl"
      >
        {editing !== null && (
          <ChallengeForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={editing === 'new' ? createChallengeDefaults : challengeToFormValues(editing)}
            onSubmit={submitForm}
            submitting={create.isPending || update.isPending}
            submitLabel={editing === 'new' ? 'Create challenge' : 'Save changes'}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete challenge"
        description={
          deleting
            ? `Permanently delete "${deleting.title}"? This removes all player progress for it and cannot be undone.`
            : undefined
        }
        confirmLabel="Delete challenge"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export { ChallengesListPage };
