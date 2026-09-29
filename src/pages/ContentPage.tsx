import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { BannersPanel } from '@/features/content/components/BannersPanel';
import { AnnouncementsPanel } from '@/features/content/components/AnnouncementsPanel';
import { NoticesPanel } from '@/features/content/components/NoticesPanel';

type ContentTab = 'banners' | 'announcements' | 'notices';

const TABS: TabItem[] = [
  { value: 'banners', label: 'Banners' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'notices', label: 'Notices' },
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
        description="Manage promo banners, announcements and community notices."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Content' }]}
      />

      <div className="space-y-4">
        <Tabs tabs={TABS} value={tab} onChange={(value) => setTab(value as ContentTab)} />

        {tab === 'banners' && <BannersPanel />}
        {tab === 'announcements' && <AnnouncementsPanel />}
        {tab === 'notices' && <NoticesPanel />}
      </div>
    </div>
  );
}

export { ContentPage };
