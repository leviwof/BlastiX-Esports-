import { useState } from 'react';
import { GroupCard } from './GroupCard';
import { MatchScoreEntryModal } from './MatchScoreEntryModal';
import type { TournamentRound, TournamentGroup } from '../types/brackets.types';

interface GroupStageGridProps {
  tournamentId: string;
  round: TournamentRound;
}

export function GroupStageGrid({ tournamentId, round }: GroupStageGridProps) {
  const [selectedGroup, setSelectedGroup] = useState<TournamentGroup | null>(null);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {round.groups.map((group) => (
          <GroupCard
            key={group.id}
            tournamentId={tournamentId}
            group={group}
            roundType={round.roundType}
            onEnterScores={() => setSelectedGroup(group)}
          />
        ))}
      </div>

      <MatchScoreEntryModal
        tournamentId={tournamentId}
        group={selectedGroup}
        open={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
      />
    </div>
  );
}
