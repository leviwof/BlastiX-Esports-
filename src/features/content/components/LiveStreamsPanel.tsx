import { useState } from 'react';
import { Plus, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { SectionCard } from '@/components/shared/SectionCard';
import {
  createLiveStreamDefaults,
  liveStreamToFormValues,
  toLiveStreamPayload,
  type LiveStreamFormValues,
} from '../content.schema';
import {
  useCreateLiveStream,
  useDeleteLiveStream,
  useLiveStreams,
  useUpdateLiveStream,
} from '../content.hooks';
import type { LiveStream } from '../content.types';
import { LiveStreamForm } from './LiveStreamForm';

function LiveStreamsPanel() {
  const [editing, setEditing] = useState<LiveStream | 'new' | null>(null);
  const [deleting, setDeleting] = useState<LiveStream | null>(null);
  const { data = [], isPending, isError, error, refetch } = useLiveStreams();
  const create = useCreateLiveStream();
  const update = useUpdateLiveStream();
  const remove = useDeleteLiveStream();

  const closeForm = () => setEditing(null);
  const submitForm = (values: LiveStreamFormValues) => {
    const body = toLiveStreamPayload(values);
    if (editing === 'new') {
      create.mutate(body, { onSuccess: closeForm });
    } else if (editing) {
      update.mutate({ id: editing.id, body }, { onSuccess: closeForm });
    }
  };
  const confirmDelete = () => {
    if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />
          New live stream
        </Button>
      </div>

      <SectionCard contentClassName="p-0">
        {isPending ? (
          <LoadingState label="Loading live streams…" />
        ) : isError ? (
          <ErrorState title="Couldn't load live streams" error={error} onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No live streams configured"
            description="Add a stream to display it on the mobile home screen."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" />
                New live stream
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-foreground-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Stream</th>
                  <th className="px-5 py-3 font-medium">Viewers</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((stream) => {
                  const busy = update.isPending && update.variables?.id === stream.id;
                  return (
                    <tr key={stream.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={stream.image_url}
                            alt=""
                            className="h-12 w-20 rounded-md border border-border object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground-soft">{stream.title}</span>
                            <span className="block max-w-sm truncate text-xs text-foreground-muted">
                              {stream.subtitle} · {stream.location}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-foreground-muted">{stream.viewer_count}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <Badge variant={stream.is_live ? 'success' : 'secondary'}>
                            {stream.is_live ? 'Live' : 'Offline'}
                          </Badge>
                          {stream.is_official && <Badge variant="default">Official</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditing(stream)} disabled={busy}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleting(stream)}
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
        )}
      </SectionCard>

      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing === 'new' ? 'New live stream' : 'Edit live stream'}
        className="max-w-2xl"
      >
        {editing !== null && (
          <LiveStreamForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={editing === 'new' ? createLiveStreamDefaults : liveStreamToFormValues(editing)}
            onSubmit={submitForm}
            submitting={create.isPending || update.isPending}
            submitLabel={editing === 'new' ? 'Create stream' : 'Save changes'}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete live stream"
        description={deleting ? `Delete “${deleting.title}”? This can't be undone.` : undefined}
        confirmLabel="Delete stream"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export { LiveStreamsPanel };
