import { useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateTime } from '@/lib/format';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from '../content.hooks';
import {
  announcementToFormValues,
  createAnnouncementDefaults,
  toAnnouncementCreatePayload,
  type AnnouncementFormValues,
} from '../content.schema';
import type { Announcement } from '../content.types';
import { AnnouncementForm } from './AnnouncementForm';

const PAGE_SIZE = 20;

/** Announcements CRUD panel (Content page tab): create / edit in a modal, delete confirmed. */
function AnnouncementsPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Announcement | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useAnnouncements({
    page,
    limit: PAGE_SIZE,
  });
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();

  const closeForm = () => setEditing(null);

  const submitForm = (values: AnnouncementFormValues) => {
    const body = toAnnouncementCreatePayload(values);
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
          New announcement
        </Button>
      </div>

      <SectionCard contentClassName="p-0">
        {isPending ? (
          <LoadingState label="Loading announcements…" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load announcements"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Post an announcement to reach every player."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" />
                New announcement
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-foreground-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Announcement</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Published</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((ann) => {
                    const busy = update.isPending && update.variables?.id === ann.id;
                    return (
                      <tr key={ann.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3">
                          <span className="block font-medium text-foreground-soft">
                            {ann.title}
                          </span>
                          <span className="block max-w-md truncate text-xs text-foreground-muted">
                            {ann.body}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={ann.is_published ? 'success' : 'secondary'}>
                            {ann.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-foreground-muted">
                          {formatDateTime(ann.published_at)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditing(ann)}
                              disabled={busy}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleting(ann)}
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
        title={editing === 'new' ? 'New announcement' : 'Edit announcement'}
        className="max-w-2xl"
      >
        {editing !== null && (
          <AnnouncementForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={
              editing === 'new' ? createAnnouncementDefaults : announcementToFormValues(editing)
            }
            onSubmit={submitForm}
            submitting={create.isPending || update.isPending}
            submitLabel={editing === 'new' ? 'Create announcement' : 'Save changes'}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete announcement"
        description={
          deleting ? `Delete “${deleting.title}”? This can't be undone.` : undefined
        }
        confirmLabel="Delete announcement"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export { AnnouncementsPanel };
