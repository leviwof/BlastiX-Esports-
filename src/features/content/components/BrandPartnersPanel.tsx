import { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useBrandPartners,
  useCreateBrandPartner,
  useUpdateBrandPartner,
  useDeleteBrandPartner,
} from '../content.hooks';
import type { BrandPartner } from '../content.types';

function BrandPartnersPanel() {
  const { data = [], isPending, isError, error, refetch } = useBrandPartners();
  const create = useCreateBrandPartner();
  const update = useUpdateBrandPartner();
  const remove = useDeleteBrandPartner();

  const [editing, setEditing] = useState<BrandPartner | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BrandPartner | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);

  const openNewModal = () => {
    setName('');
    setIsActive(true);
    setLogoFile(undefined);
    setEditing('new');
  };

  const openEditModal = (partner: BrandPartner) => {
    setName(partner.name);
    setIsActive(partner.is_active ?? true);
    setLogoFile(undefined);
    setEditing(partner);
  };

  const closeModal = () => {
    setEditing(null);
    setName('');
    setLogoFile(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editing === 'new') {
      create.mutate(
        {
          body: { name: name.trim(), is_active: isActive },
          logo: logoFile,
        },
        { onSuccess: closeModal },
      );
    } else if (editing && typeof editing === 'object') {
      update.mutate(
        {
          id: editing.id,
          body: { name: name.trim(), is_active: isActive },
        },
        { onSuccess: closeModal },
      );
    }
  };

  return (
    <>
      <SectionCard
        title="Brand partners"
        description="Manage partner logos displayed on the mobile app home screen."
        action={
          <Button size="sm" onClick={openNewModal}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add partner
          </Button>
        }
      >
        {isPending ? (
          <LoadingState label="Loading brand partners…" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load brand partners"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No brand partners added"
            description="Add your official brand partners and sponsors to showcase them on the mobile home screen."
            action={
              <Button size="sm" onClick={openNewModal}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add brand partner
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background/80 p-1">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-foreground-muted" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{partner.name}</h4>
                      {partner.is_active !== false ? (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted bg-muted/20 text-foreground-muted">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(partner)}>
                    <Edit2 className="h-4 w-4 text-foreground-muted hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(partner)}>
                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal
        open={editing !== null}
        onClose={closeModal}
        title={editing === 'new' ? 'Add Brand Partner' : 'Edit Brand Partner'}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="partner-name">
              Partner / Brand Name
            </label>
            <Input
              id="partner-name"
              placeholder="e.g. Red Bull Esports"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="partner-logo">
              Logo Image {editing !== 'new' && '(Optional update)'}
            </label>
            <Input
              id="partner-logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0])}
              required={editing === 'new'}
            />
            <p className="text-xs text-foreground-muted">PNG, JPEG or WebP (Max 5MB)</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium text-foreground">Status Active</span>
            <Button
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? <CheckCircle className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
              {isActive ? 'Active' : 'Inactive'}
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editing === 'new' ? 'Add Partner' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
          }
        }}
        title="Delete Brand Partner"
        description={`Are you sure you want to delete ${deleting?.name}?`}
        destructive
        loading={remove.isPending}
      />
    </>
  );
}

export { BrandPartnersPanel };
