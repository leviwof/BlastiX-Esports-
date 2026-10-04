import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { BannersPanel } from '@/features/content/components/BannersPanel';
import { AnnouncementsPanel } from '@/features/content/components/AnnouncementsPanel';
import { NoticesPanel } from '@/features/content/components/NoticesPanel';
import { PushBroadcastPanel } from '@/features/notifications/PushBroadcastPanel';

type ContentTab = 'banners' | 'announcements' | 'notices' | 'push';

const TABS: TabItem[] = [
  { value: 'banners', label: 'Banners' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'notices', label: 'Notices' },
  { value: 'push', label: 'Push notifications' },
];

/**
 * Content management — one page, three resources (promo banners, announcements,
 * community notices) behind a tab strip. Each panel owns its own list + CRUD.
 */
function ContentPage() {
  const [tab, setTab] = useState<ContentTab>('banners');

  return (
    <div>
      <PageHeader
        title="Content"
        description="Manage app content and send push notifications."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Content' }]}
      />

      <div className="space-y-4">
        <Tabs tabs={TABS} value={tab} onChange={(value) => setTab(value as ContentTab)} />

        {tab === 'banners' && <BannersPanel />}
        {tab === 'announcements' && <AnnouncementsPanel />}
        {tab === 'notices' && <NoticesPanel />}
        {tab === 'push' && <PushBroadcastPanel />}
      </div>
    </div>
  );
}

export { ContentPage };
