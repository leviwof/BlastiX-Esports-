import { PageHeader } from '@/components/shared/PageHeader';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';
import { FreeFireLivePanel } from '@/features/live/freefire/components/FreeFireLivePanel';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Flame, Plus, Trophy } from 'lucide-react';
import { useState } from 'react';

/**
 * /freefire/live — Free Fire Live Management Page.
 * Displays both active platform Free Fire LIVE tournaments and official Garena FF broadcast/portal.
 */
function FreeFireLivePage() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'official'>('tournaments');

  return (
    <div className="space-y-6">
      <PageHeader
        title="🔥 Free Fire Live Tournaments"
        description="Monitor and manage all live Free Fire tournaments running in the arena. Updates sync directly to the Free Fire Live section of the mobile app."
        breadcrumbs={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Free Fire Live', to: '/freefire/tournaments' },
          { label: 'Live' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/freefire/tournaments">
                <Trophy className="h-4 w-4 mr-1 text-amber-400" />
                Manage All
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link to="/freefire/tournaments/new">
                <Plus className="h-4 w-4 mr-1" />
                New FF Live Tournament
              </Link>
            </Button>
          </div>
        }
      />

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('tournaments')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'tournaments'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-foreground-muted hover:text-foreground hover:bg-white/5 border border-transparent'
          }`}
        >
          <Flame className="h-4 w-4 text-amber-400" />
          <span>Active Free Fire Rooms & Matches</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('official')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'official'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-foreground-muted hover:text-foreground hover:bg-white/5 border border-transparent'
          }`}
        >
          <span>Official Garena Broadcast & Web Hub</span>
        </button>
      </div>

      {activeTab === 'tournaments' ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <strong>App Visibility:</strong> Tournaments listed here are currently LIVE and show in the <strong>Free Fire Live</strong> tab of the mobile app.
          </div>
          <TournamentBrowser
            lockedStatus="LIVE"
            filterSection="freefire"
            showActions
            emptyTitle="No Free Fire tournaments live right now"
            emptyDescription="Create a Free Fire tournament or transition an upcoming one to LIVE to start rooms and receive live match scores."
          />
        </div>
      ) : (
        <FreeFireLivePanel />
      )}
    </div>
  );
}

export { FreeFireLivePage };
