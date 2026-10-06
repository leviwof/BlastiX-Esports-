import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { BannersPanel } from '@/features/content/components/BannersPanel';
import { AnnouncementsPanel } from '@/features/content/components/AnnouncementsPanel';
import { NoticesPanel } from '@/features/content/components/NoticesPanel';
import { LiveStreamsPanel } from '@/features/content/components/LiveStreamsPanel';
import { PartnerInquiriesPanel } from '@/features/content/components/PartnerInquiriesPanel';
import { PushBroadcastPanel } from '@/features/notifications/PushBroadcastPanel';

type ContentTab = 'banners' | 'live-streams' | 'partner-inquiries' | 'announcements' | 'notices' | 'push';

const TABS: TabItem[] = [
  { value: 'banners', label: 'Banners' },
  { value: 'live-streams', label: 'Live streams' },
  { value: 'partner-inquiries', label: 'Partner inquiries' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'notices', label: 'Notices' },
  { value: 'push', label: 'Push notifications' },
];

/**
 * Content management — home banners/streams, partner inquiries, announcements,
 * notices, and push notifications behind a tab strip.
 */
function ContentPage() {
  const [tab, setTab] = useState<ContentTab>('banners');

  return (
    <div>
      <PageHeader
        title="Content"
        description="Manage home screen content, partner requests, and push notifications."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Content' }]}
      />

      <div className="space-y-4">
        <Tabs tabs={TABS} value={tab} onChange={(value) => setTab(value as ContentTab)} />

        {tab === 'banners' && <BannersPanel />}
        {tab === 'live-streams' && <LiveStreamsPanel />}
        {tab === 'partner-inquiries' && <PartnerInquiriesPanel />}
        {tab === 'announcements' && <AnnouncementsPanel />}
        {tab === 'notices' && <NoticesPanel />}
        {tab === 'push' && <PushBroadcastPanel />}
      </div>
    </div>
  );
}

export { ContentPage };
