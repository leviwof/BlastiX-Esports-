import { useState } from 'react';
import { Handshake, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { SectionCard } from '@/components/shared/SectionCard';
import { formatDateTime } from '@/lib/format';
import { usePartnerInquiries } from '../content.hooks';
import type { PartnerInquiry } from '../content.types';

function PartnerInquiriesPanel() {
  const { data = [], isPending, isError, error, refetch } = usePartnerInquiries();
  const [selected, setSelected] = useState<PartnerInquiry | null>(null);

  return (
    <>
      <SectionCard
        title="Partner inquiries"
        description="Recent sponsorship and brand partnership requests."
        contentClassName="p-0"
      >
        {isPending ? (
          <LoadingState label="Loading partner inquiries…" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load partner inquiries"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="No partner inquiries yet"
            description="New requests submitted from the app will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-foreground-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Brand / contact</th>
                  <th className="px-5 py-3 font-medium">Partnership</th>
                  <th className="px-5 py-3 font-medium">Received</th>
                  <th className="px-5 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      <span className="block font-medium text-foreground-soft">{inquiry.brand_name}</span>
                      <span className="block text-xs text-foreground-muted">{inquiry.contact_name}</span>
                    </td>
                    <td className="px-5 py-3 text-foreground-muted">{inquiry.partnership_type}</td>
                    <td className="px-5 py-3 text-xs text-foreground-muted">
                      {formatDateTime(inquiry.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(inquiry)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.brand_name ?? 'Partner inquiry'}
        className="max-w-xl"
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-foreground">{selected.contact_name}</p>
              <p className="text-xs text-foreground-muted">{selected.partnership_type}</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`mailto:${selected.email}`}>
                <Mail className="h-4 w-4" />
                {selected.email}
              </a>
              <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`tel:${selected.phone}`}>
                <Phone className="h-4 w-4" />
                {selected.phone}
              </a>
            </div>
            <div className="rounded-lg border border-border bg-surface/40 p-4">
              <p className="whitespace-pre-wrap text-sm text-foreground-soft">{selected.message}</p>
            </div>
            <p className="text-xs text-foreground-muted">Received {formatDateTime(selected.created_at)}</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export { PartnerInquiriesPanel };
