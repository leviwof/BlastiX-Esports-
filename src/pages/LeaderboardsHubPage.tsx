import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { TournamentBrowser } from '@/features/tournaments/components/TournamentBrowser';
import { GlobalPlayersLeaderboard } from '@/features/leaderboard/components/GlobalPlayersLeaderboard';
import { Trophy, Users } from 'lucide-react';

type TabKey = 'players' | 'tournaments';

/**
 * /leaderboards — View global player rankings (points, kills, wins) or browse tournament-specific standings.
 */
function LeaderboardsHubPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('players');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboards & Standings"
        description="Track overall player rankings across BLASTiX or drill down into tournament standings."
        breadcrumbs={[{ label: 'Admin', to: '/dashboard' }, { label: 'Leaderboards' }]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'players'
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Global Player Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'tournaments'
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Tournament Standings</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'players' ? (
        <GlobalPlayersLeaderboard />
      ) : (
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-zinc-400">
            Select a tournament to inspect its match results, brackets, and team standings:
          </div>
          <TournamentBrowser
            cardTo={(t) => `/tournaments/${t.id}`}
            emptyTitle="No tournaments yet"
            emptyDescription="Standings appear once a tournament has recorded results."
          />
        </div>
      )}
    </div>
  );
}

export { LeaderboardsHubPage };

