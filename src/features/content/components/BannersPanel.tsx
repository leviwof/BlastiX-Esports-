import { useState } from 'react';
import { ImageIcon, Plus } from 'lucide-react';
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
import { useBanners, useCreateBanner, useDeleteBanner, useUpdateBanner } from '../content.hooks';
import {
  bannerToFormValues,
  createBannerDefaults,
  toBannerCreatePayload,
  type BannerFormValues,
} from '../content.schema';
import { uploadAdminImage } from '@/lib/imageUpload';
import { getErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';
import type { Banner } from '../content.types';
import { BannerForm } from './BannerForm';

const PAGE_SIZE = 20;

/** Banners CRUD panel (Content page tab): create / edit in a modal, delete confirmed. */
function BannersPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const { data, isPending, isError, error, refetch, isFetching } = useBanners({
    page,
    limit: PAGE_SIZE,
  });
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const remove = useDeleteBanner();

  const closeForm = () => setEditing(null);

  const submitForm = async (values: BannerFormValues, image?: File) => {
    const body = toBannerCreatePayload(values);
    if (editing === 'new') {
      if (image) create.mutate({ body, image }, { onSuccess: closeForm });
    } else if (editing) {
      setUploadingEditImage(true);
      try {
        const imageUrl = image ? await uploadAdminImage(image) : undefined;
        update.mutate(
          { id: editing.id, body: { ...body, image_url: imageUrl ?? body.image_url } },
          { onSuccess: closeForm },
        );
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setUploadingEditImage(false);
      }
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
          New banner
        </Button>
      </div>

      <SectionCard contentClassName="p-0">
        {isPending ? (
          <LoadingState label="Loading banners…" />
        ) : isError ? (
          <ErrorState title="Couldn't load banners" error={error} onRetry={() => void refetch()} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No banners yet"
            description="Create a banner to feature it in the app."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" />
                New banner
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-foreground-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Banner</th>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Window</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((banner) => {
                    const busy = update.isPending && update.variables?.id === banner.id;
                    return (
                      <tr key={banner.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3">
                          <span className="block font-medium text-foreground-soft">
                            {banner.title}
                          </span>
                          <span className="block max-w-xs truncate text-xs text-foreground-muted">
                            {banner.image_url}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-foreground-muted">{banner.sort_order}</td>
                        <td className="px-5 py-3 text-xs text-foreground-muted">
                          {banner.starts_at || banner.ends_at
                            ? `${formatDateTime(banner.starts_at)} → ${formatDateTime(banner.ends_at)}`
                            : 'Always'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={banner.is_active ? 'success' : 'secondary'}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditing(banner)}
                              disabled={busy}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleting(banner)}
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
        title={editing === 'new' ? 'New banner' : 'Edit banner'}
        className="max-w-2xl"
      >
        {editing !== null && (
          <BannerForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={editing === 'new' ? createBannerDefaults : bannerToFormValues(editing)}
            onSubmit={submitForm}
            submitting={create.isPending || update.isPending || uploadingEditImage}
            submitLabel={editing === 'new' ? 'Create banner' : 'Save changes'}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete banner"
        description={
          deleting ? `Delete “${deleting.title}”? This can't be undone.` : undefined
        }
        confirmLabel="Delete banner"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export { BannersPanel };
