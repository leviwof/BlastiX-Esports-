import { AlertTriangle, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { useResolveTieBreaker } from '../hooks/useBracketEngine';
import type { TournamentTieBreaker, TournamentRound } from '../types/brackets.types';

interface TieBreakerResolutionModalProps {
  tournamentId: string;
  tieBreaker: TournamentTieBreaker | null;
  round: TournamentRound | null;
  open: boolean;
  onClose: () => void;
}

export function TieBreakerResolutionModal({
  tournamentId,
  tieBreaker,
  round,
  open,
  onClose,
}: TieBreakerResolutionModalProps) {
  const resolveTieBreaker = useResolveTieBreaker(tournamentId);

  if (!tieBreaker) return null;

  // Find the group and tied teams
  const group = round?.groups.find((g) => g.id === tieBreaker.groupId);
  const tiedGroupTeams = group?.groupTeams.filter((gt) =>
    tieBreaker.tiedTeamIds.includes(gt.tournamentTeamId),
  ) || [];

  const recommendedTeam = tiedGroupTeams.find(
    (gt) => gt.tournamentTeamId === tieBreaker.recommendedTeamId,
  );

  const handleSelectTeam = async (teamId: string) => {
    await resolveTieBreaker.mutateAsync({
      tieBreakerId: tieBreaker.id,
      payload: { selectedTeamId: teamId },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Qualification Tie-Breaker Resolution"
      description={
        <span>
          Teams are tied at the qualification boundary in{' '}
          <strong className="text-amber-400">{group?.name || 'Group'}</strong>. Review stats below
          and approve which team advances.
        </span>
      }
      className="max-w-xl bg-[#0B0E14] border-amber-500/30"
    >
      <div className="space-y-4">
        {/* Recommendation Banner */}
        {recommendedTeam && (
          <div className="flex items-start gap-3 rounded-lg border border-[#11FBBE]/30 bg-[#11FBBE]/10 p-3 text-xs">
            <Sparkles className="h-5 w-5 text-[#11FBBE] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#11FBBE]">
                System Recommended: {recommendedTeam.tournamentTeam?.name}
              </div>
              <p className="text-foreground-soft mt-0.5">
                Highest tie-breaking metric (placement performance and overall points). You can
                accept this recommendation or manually pick any tied team below.
              </p>
            </div>
          </div>
        )}

        {/* Tied Teams Cards */}
        <div className="grid gap-3">
          {tiedGroupTeams.map((team) => {
            const isRecommended = team.tournamentTeamId === tieBreaker.recommendedTeamId;

            return (
              <div
                key={team.tournamentTeamId}
                className={`relative flex items-center justify-between rounded-lg border p-3 transition-all ${
                  isRecommended
                    ? 'border-[#11FBBE]/40 bg-[#11FBBE]/5 shadow-[0_0_15px_rgba(17,251,190,0.08)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-foreground">
                      {team.tournamentTeam?.name || 'Team'}
                    </span>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#11FBBE]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#11FBBE]">
                        <ShieldCheck className="h-3 w-3" />
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-4 text-xs text-foreground-muted">
                    <span>
                      Total Points:{' '}
                      <strong className="text-foreground">{team.totalPoints}</strong>
                    </span>
                    <span>
                      Kills: <strong className="text-foreground">{team.kills}</strong>
                    </span>
                    <span>
                      Placement Pts:{' '}
                      <strong className="text-foreground">{team.placementPoints}</strong>
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleSelectTeam(team.tournamentTeamId)}
                  disabled={resolveTieBreaker.isPending}
                  className={
                    isRecommended
                      ? 'bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-foreground'
                  }
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve & Advance
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-foreground-muted border-t border-white/5 pt-3">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>
            Selecting a team will break the tie, record the action in the audit log, and
            automatically resume round advancement.
          </span>
        </div>
      </div>
    </Modal>
  );
}
