import { useState, useEffect } from 'react';
import {
  Swords,
  Trophy,
  AlertTriangle,
  Play,
  FastForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TournamentStageStepper, type StageKey } from './TournamentStageStepper';
import { GroupStageGrid } from './GroupStageGrid';
import { WildCardManager } from './WildCardManager';
import { GrandFinalAssemblyCard } from './GrandFinalAssemblyCard';
import { TieBreakerResolutionModal } from './TieBreakerResolutionModal';
import {
  useTournamentRounds,
  usePendingTieBreakers,
  useWildCardStatus,
  useGenerateRound1,
  useAdvanceRound1,
  useAdvanceRound2,
  useGenerateRound3,
  useAdvanceRound3,
} from '../hooks/useBracketEngine';
import type { TournamentRound, TournamentTieBreaker } from '../types/brackets.types';

interface TournamentStageControlHubProps {
  tournamentId: string;
}

export function TournamentStageControlHub({ tournamentId }: TournamentStageControlHubProps) {
  const { data: rounds = [], isLoading } = useTournamentRounds(tournamentId);
  const { data: pendingTieBreakers = [] } = usePendingTieBreakers(tournamentId);
  const { data: wildCardData } = useWildCardStatus(tournamentId);

  const [activeStage, setActiveStage] = useState<StageKey>('ROUND_1');
  const [activeTieBreaker, setActiveTieBreaker] = useState<TournamentTieBreaker | null>(null);

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  // Mutations
  const generateR1 = useGenerateRound1(tournamentId);
  const advanceR1 = useAdvanceRound1(tournamentId);
  const advanceR2 = useAdvanceRound2(tournamentId);
  const generateR3 = useGenerateRound3(tournamentId);
  const advanceR3 = useAdvanceRound3(tournamentId);

  // Auto-select latest live or active stage
  useEffect(() => {
    if (rounds.length > 0) {
      const gf = rounds.find((r) => r.roundType === 'GRAND_FINAL');
      const r3 = rounds.find((r) => r.roundType === 'ROUND_3');
      const r2 = rounds.find((r) => r.roundType === 'ROUND_2');
      const r1 = rounds.find((r) => r.roundType === 'ROUND_1');

      if (gf && gf.status === 'LIVE') {
        setActiveStage('GRAND_FINAL');
      } else if (r3 && (r3.status === 'LIVE' || r3.status === 'TIE_BREAKER_PENDING')) {
        setActiveStage('ROUND_3');
      } else if (r2 && (r2.status === 'LIVE' || r2.status === 'TIE_BREAKER_PENDING')) {
        setActiveStage('ROUND_2');
      } else if (r1 && (r1.status === 'LIVE' || r1.status === 'TIE_BREAKER_PENDING')) {
        setActiveStage('ROUND_1');
      }
    }
  }, [rounds]);

  const activeRound: TournamentRound | undefined = rounds.find(
    (r) => r.roundType === activeStage,
  );

  const r1 = rounds.find((r) => r.roundType === 'ROUND_1');
  const r2 = rounds.find((r) => r.roundType === 'ROUND_2');
  const r3 = rounds.find((r) => r.roundType === 'ROUND_3');
  const gf = rounds.find((r) => r.roundType === 'GRAND_FINAL');

  const isR1Completed = r1?.status === 'COMPLETED';
  const isR2Completed = r2?.status === 'COMPLETED';
  const isR3Completed = r3?.status === 'COMPLETED';

  // Handle stage advances with safety confirmations
  const triggerAdvanceRound1 = () => {
    setConfirmState({
      open: true,
      title: 'Advance Round 1 to Round 2?',
      description:
        'This action will calculate official standings across all 8 groups, qualify the top 48 teams (Top 6 per group) to Round 2, eliminate 48 teams, and seed Round 2 groups.',
      action: () => advanceR1.mutate(),
    });
  };

  const triggerAdvanceRound2 = () => {
    setConfirmState({
      open: true,
      title: 'Advance Round 2?',
      description:
        'This action will advance the Top 2 teams from each group directly to the Grand Final (8 teams), qualify Ranks 3 to 9 to Round 3 (28 teams), and eliminate Ranks 10 to 12.',
      action: () => advanceR2.mutate(),
    });
  };

  const triggerAdvanceRound3 = () => {
    setConfirmState({
      open: true,
      title: 'Advance Round 3 to Grand Final?',
      description:
        'This action will advance the Top 3 teams from each of the 3 groups (9 teams) to the Grand Final, and eliminate Ranks 4 to 12.',
      action: () => advanceR3.mutate(),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Stepper */}
      <TournamentStageStepper
        currentStage={activeStage}
        onSelectStage={setActiveStage}
        rounds={rounds}
        wildCardStatus={wildCardData?.status || 'CLOSED'}
      />

      {/* 2. Tie Breaker Warning Banner */}
      {pendingTieBreakers.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-display font-bold text-amber-300">
                Action Required: Qualification Tie-Breaker Pending
              </div>
              <p className="text-xs text-foreground-muted">
                {pendingTieBreakers.length} group(s) have tied teams at the progression threshold.
                Advancement is paused until admin resolves the tie.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveTieBreaker(pendingTieBreakers[0])}
            className="bg-amber-400 text-black font-semibold hover:bg-amber-300"
          >
            Review & Break Tie
          </Button>
        </div>
      )}

      {/* 3. Stage Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
        <div className="flex items-center gap-2 text-foreground-muted">
          <span className="font-semibold text-foreground">Current Stage Actions:</span>
          <span className="font-mono text-[#11FBBE]">{activeStage.replace('_', ' ')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeStage === 'ROUND_1' && (
            <>
              {!r1 ? (
                <Button
                  size="sm"
                  onClick={() => generateR1.mutate()}
                  disabled={generateR1.isPending}
                  className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Generate Round 1 (96 Teams)
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={triggerAdvanceRound1}
                  disabled={advanceR1.isPending || isR1Completed}
                  className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                >
                  <FastForward className="h-3.5 w-3.5 mr-1" />
                  {isR1Completed ? 'Round 1 Completed' : 'Advance Round 1 (Top 48)'}
                </Button>
              )}
            </>
          )}

          {activeStage === 'ROUND_2' && (
            <Button
              size="sm"
              onClick={triggerAdvanceRound2}
              disabled={advanceR2.isPending || isR2Completed || !r2}
              className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
            >
              <FastForward className="h-3.5 w-3.5 mr-1" />
              {isR2Completed ? 'Round 2 Completed' : 'Advance Round 2 (Exit to GF & R3)'}
            </Button>
          )}

          {activeStage === 'WILDCARD' && (
            <span className="text-xs text-foreground-muted italic">
              Manage 8 Wild Card slots in the panel below.
            </span>
          )}

          {activeStage === 'ROUND_3' && (
            <>
              {!r3 ? (
                <Button
                  size="sm"
                  onClick={() => generateR3.mutate()}
                  disabled={generateR3.isPending || !isR2Completed}
                  title={!isR2Completed ? 'Round 2 must be completed first' : ''}
                  className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Generate Round 3 (36 Teams)
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={triggerAdvanceRound3}
                  disabled={advanceR3.isPending || isR3Completed}
                  className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                >
                  <FastForward className="h-3.5 w-3.5 mr-1" />
                  {isR3Completed ? 'Round 3 Completed' : 'Advance Round 3 (Top 9 to GF)'}
                </Button>
              )}
            </>
          )}

          {activeStage === 'GRAND_FINAL' && (
            <span className="text-xs text-foreground-muted italic">
              Assemble 18 Finalists & launch the Grand Final lobby.
            </span>
          )}
        </div>
      </div>

      {/* 4. Active Stage Body */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-foreground-muted">
          Loading bracket details...
        </div>
      ) : (
        <>
          {/* Round 1, 2, or 3 Grid */}
          {(activeStage === 'ROUND_1' || activeStage === 'ROUND_2' || activeStage === 'ROUND_3') && (
            <>
              {activeRound && activeRound.groups.length > 0 ? (
                <GroupStageGrid tournamentId={tournamentId} round={activeRound} />
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
                  <Swords className="h-8 w-8 mx-auto text-foreground-muted/40 mb-2" />
                  <h4 className="font-display font-semibold text-foreground">
                    {activeStage.replace('_', ' ')} Not Generated Yet
                  </h4>
                  <p className="text-xs text-foreground-muted mt-1 max-w-md mx-auto">
                    Click the &quot;Generate&quot; action button above once all conditions and prior
                    rounds are satisfied.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Wild Card Manager */}
          {activeStage === 'WILDCARD' && (
            <WildCardManager
              tournamentId={tournamentId}
              isRound1Completed={isR1Completed}
            />
          )}

          {/* Grand Final Card & Matches */}
          {activeStage === 'GRAND_FINAL' && (
            <div className="space-y-6">
              <GrandFinalAssemblyCard tournamentId={tournamentId} rounds={rounds} />

              {gf && gf.groups.length > 0 && (
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#11FBBE]" />
                    Grand Final Lobby Standings
                  </h4>
                  <GroupStageGrid tournamentId={tournamentId} round={gf} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals & Dialogs */}
      <TieBreakerResolutionModal
        tournamentId={tournamentId}
        tieBreaker={activeTieBreaker}
        round={rounds.find((r) => r.id === activeTieBreaker?.roundId) || null}
        open={Boolean(activeTieBreaker)}
        onClose={() => setActiveTieBreaker(null)}
      />

      <ConfirmDialog
        open={confirmState.open}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Confirm & Advance"
        destructive
        onConfirm={() => {
          confirmState.action();
          setConfirmState((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}
