import { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { formatEnum } from '@/lib/format';
import {
  useCreateNotice,
  useDeleteNotice,
  useNotices,
  useUpdateNotice,
} from '../content.hooks';
import {
  createNoticeDefaults,
  noticeToFormValues,
  toNoticeCreatePayload,
  type NoticeFormValues,
} from '../content.schema';
import type { Notice } from '../content.types';
import { NoticeForm } from './NoticeForm';

const PAGE_SIZE = 20;

/** Maps a notice severity to a Badge variant (unknown values fall back to secondary). */
function severityVariant(severity: string): BadgeProps['variant'] {
  switch (severity) {
    case 'CRITICAL':
      return 'danger';
    case 'WARNING':
      return 'warning';
    default:
      return 'secondary';
  }
}

/** Community notices CRUD panel (Content page tab): create / edit in a modal, delete confirmed. */
function NoticesPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Notice | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Notice | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useNotices({
    page,
    limit: PAGE_SIZE,
  });
  const create = useCreateNotice();
  const update = useUpdateNotice();
  const remove = useDeleteNotice();

  const closeForm = () => setEditing(null);

  const submitForm = (values: NoticeFormValues) => {
    const body = toNoticeCreatePayload(values);
    if (editing === 'new') {
      create.mutate(body, { onSuccess: closeForm });
    } else if (editing) {
      update.mutate({ id: editing.id, body }, { onSuccess: closeForm });
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />
          New notice
        </Button>
      </div>

      <SectionCard contentClassName="p-0">
        {isPending ? (
          <LoadingState label="Loading notices…" />
        ) : isError ? (
          <ErrorState title="Couldn't load notices" error={error} onRetry={() => void refetch()} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notices yet"
            description="Post a community notice to keep players informed."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" />
                New notice
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-foreground-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Notice</th>
                    <th className="px-5 py-3 font-medium">Severity</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((notice) => {
                    const busy = update.isPending && update.variables?.id === notice.id;
                    return (
                      <tr key={notice.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3">
                          <span className="block font-medium text-foreground-soft">
                            {notice.title}
                          </span>
                          <span className="block max-w-md truncate text-xs text-foreground-muted">
                            {notice.body}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={severityVariant(notice.severity)}>
                            {formatEnum(notice.severity)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={notice.is_active ? 'success' : 'secondary'}>
                            {notice.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditing(notice)}
                              disabled={busy}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleting(notice)}
                              disabled={busy}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing === 'new' ? 'New notice' : 'Edit notice'}
        className="max-w-2xl"
      >
        {editing !== null && (
          <NoticeForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={editing === 'new' ? createNoticeDefaults : noticeToFormValues(editing)}
            onSubmit={submitForm}
            submitting={create.isPending || update.isPending}
            submitLabel={editing === 'new' ? 'Create notice' : 'Save changes'}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete notice"
        description={
          deleting ? `Delete “${deleting.title}”? This can't be undone.` : undefined
        }
        confirmLabel="Delete notice"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export { NoticesPanel };
