import { useState, useEffect } from 'react';
import {
  Swords,
  Trophy,
  AlertTriangle,
  Play,
  FastForward,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TournamentStageStepper, type StageStepConfig } from './TournamentStageStepper';
import { GroupStageGrid } from './GroupStageGrid';
import { WildCardManager } from './WildCardManager';
import { GrandFinalAssemblyCard } from './GrandFinalAssemblyCard';
import { TieBreakerResolutionModal } from './TieBreakerResolutionModal';
import { useTournament } from '@/features/tournaments/tournaments.hooks';
import {
  useTournamentRounds,
  usePendingTieBreakers,
  useWildCardStatus,
  useGenerateRound1,
  useAdvanceRound1,
  useAdvanceRound2,
  useGenerateRound3,
  useAdvanceRound3,
  useAssembleGrandFinal,
  useGenerateStage,
  useFinalizeRound,
} from '../hooks/useBracketEngine';
import type { TournamentRound, TournamentTieBreaker } from '../types/brackets.types';

interface TournamentStageControlHubProps {
  tournamentId: string;
}

export function TournamentStageControlHub({ tournamentId }: TournamentStageControlHubProps) {
  const { data: tournament } = useTournament(tournamentId);
  const { data: rounds = [], isLoading } = useTournamentRounds(tournamentId);
  const { data: pendingTieBreakers = [] } = usePendingTieBreakers(tournamentId);
  const { data: wildCardData } = useWildCardStatus(tournamentId);

  // Dynamic stages from format plan
  const formatPlanStages: any[] =
    (tournament?.roadmap_data as any)?.stages ||
    (tournament?.format_plan as any)?.stages ||
    (Array.isArray(tournament?.roadmap_data) ? tournament.roadmap_data : []);

  const isDynamicFormat = formatPlanStages.length > 0;

  // Custom stage tabs if dynamic
  const customStages: StageStepConfig[] | undefined = isDynamicFormat
    ? formatPlanStages.map((stage: any, idx: number) => {
        const isGrandFinal = stage.isGrandFinal || idx === formatPlanStages.length - 1;
        const stageName = stage.stageName || (isGrandFinal ? 'Grand Final' : `Stage ${idx + 1}`);
        const totalUnits = stage.totalUnits || stage.units || stage.participatingTeams || 0;
        const groups = stage.lobbyCount || stage.groups || stage.matchesCount || 1;

        return {
          key: `STAGE_${idx + 1}`,
          title: stageName,
          subtitle: `${totalUnits} Units · ${groups} ${groups === 1 ? 'Group' : 'Groups'}`,
          icon: isGrandFinal ? Trophy : Swords,
        };
      })
    : undefined;

  const [activeStage, setActiveStage] = useState<string>(
    isDynamicFormat ? 'STAGE_1' : 'ROUND_1'
  );
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

  // Legacy mutations
  const generateR1 = useGenerateRound1(tournamentId);
  const advanceR1 = useAdvanceRound1(tournamentId);
  const advanceR2 = useAdvanceRound2(tournamentId);
  const generateR3 = useGenerateRound3(tournamentId);
  const advanceR3 = useAdvanceRound3(tournamentId);
  const assembleGF = useAssembleGrandFinal(tournamentId);

  // Dynamic mutations
  const generateStageMutation = useGenerateStage(tournamentId);
  const finalizeRoundMutation = useFinalizeRound(tournamentId);

  // Auto-select latest active stage
  useEffect(() => {
    if (rounds.length > 0) {
      if (isDynamicFormat) {
        // Find latest live or pending round
        const liveRound = [...rounds].reverse().find((r) => r.status === 'LIVE' || r.status === 'TIE_BREAKER_PENDING');
        if (liveRound) {
          setActiveStage(`STAGE_${liveRound.roundNumber}`);
        } else {
          const maxRoundNum = Math.max(...rounds.map((r) => r.roundNumber));
          setActiveStage(`STAGE_${maxRoundNum}`);
        }
      } else {
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
    }
  }, [rounds, isDynamicFormat]);

  // Determine current active round
  const currentStageIndex = isDynamicFormat
    ? parseInt(activeStage.replace('STAGE_', ''), 10)
    : 1;

  const totalDynamicStages = formatPlanStages.length;
  const isGrandFinalStage = isDynamicFormat
    ? currentStageIndex === totalDynamicStages
    : activeStage === 'GRAND_FINAL';

  const activeRound: TournamentRound | undefined = isDynamicFormat
    ? rounds.find((r) => r.roundNumber === currentStageIndex)
    : rounds.find((r) => r.roundType === activeStage);

  // Status flags
  const isCurrentRoundCompleted = activeRound?.status === 'COMPLETED';

  // Legacy round checks
  const r1 = rounds.find((r) => r.roundType === 'ROUND_1');
  const r2 = rounds.find((r) => r.roundType === 'ROUND_2');
  const r3 = rounds.find((r) => r.roundType === 'ROUND_3');

  const isR1Completed = r1?.status === 'COMPLETED';
  const isR2Completed = r2?.status === 'COMPLETED';
  const isR3Completed = r3?.status === 'COMPLETED';

  // Dynamic stage trigger
  const triggerDynamicGenerate = (stageNum: number) => {
    generateStageMutation.mutate(stageNum);
  };

  const triggerDynamicFinalize = (roundId: string, stageNum: number) => {
    setConfirmState({
      open: true,
      title: `Finalize Stage ${stageNum} and Advance Qualifiers?`,
      description: `This action will lock group standings for Stage ${stageNum}, determine top qualifiers, and seed the next stage.`,
      action: () => finalizeRoundMutation.mutate(roundId),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Universal Dynamic Stepper */}
      <TournamentStageStepper
        currentStage={activeStage}
        onSelectStage={setActiveStage}
        rounds={rounds}
        wildCardStatus={wildCardData?.status || 'CLOSED'}
        customStages={customStages}
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

      {/* 3. Universal Stage Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#12131A] p-4 text-xs shadow-md">
        <div className="flex items-center gap-2 text-foreground-muted">
          <span className="font-semibold text-foreground">Current Stage Runner:</span>
          <span className="font-mono text-cyan-400 font-bold uppercase">
            {isDynamicFormat ? `Stage ${currentStageIndex} ${isGrandFinalStage ? '(Grand Final)' : ''}` : activeStage.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Universal Dynamic Mode */}
          {isDynamicFormat ? (
            <>
              {!activeRound ? (
                <Button
                  size="sm"
                  onClick={() => triggerDynamicGenerate(currentStageIndex)}
                  disabled={generateStageMutation.isPending}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Generate Stage {currentStageIndex}
                </Button>
              ) : isGrandFinalStage ? (
                <Button
                  size="sm"
                  onClick={() => assembleGF.mutate()}
                  disabled={assembleGF.isPending || isCurrentRoundCompleted}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                >
                  <Crown className="h-3.5 w-3.5 mr-1" />
                  {isCurrentRoundCompleted ? 'Grand Final Completed' : 'Assemble & Finalize Grand Final'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => triggerDynamicFinalize(activeRound.id, currentStageIndex)}
                  disabled={finalizeRoundMutation.isPending || isCurrentRoundCompleted}
                  className="bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  <FastForward className="h-3.5 w-3.5 mr-1" />
                  {isCurrentRoundCompleted
                    ? `Stage ${currentStageIndex} Completed`
                    : `Advance Stage ${currentStageIndex} Qualifiers ➔ Stage ${currentStageIndex + 1}`}
                </Button>
              )}
            </>
          ) : (
            /* Legacy Mode Backward Compatibility */
            <>
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
                      onClick={() => advanceR1.mutate()}
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
                  onClick={() => advanceR2.mutate()}
                  disabled={advanceR2.isPending || isR2Completed || !r2}
                  className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                >
                  <FastForward className="h-3.5 w-3.5 mr-1" />
                  {isR2Completed ? 'Round 2 Completed' : 'Advance Round 2 (Exit to GF & R3)'}
                </Button>
              )}

              {activeStage === 'WILDCARD' && (
                <span className="text-xs text-foreground-muted italic">
                  Manage Wild Card slots in the panel below.
                </span>
              )}

              {activeStage === 'ROUND_3' && (
                <>
                  {!r3 ? (
                    <Button
                      size="sm"
                      onClick={() => generateR3.mutate()}
                      disabled={generateR3.isPending || !isR2Completed}
                      className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
                    >
                      <Play className="h-3.5 w-3.5 mr-1" />
                      Generate Round 3 (36 Teams)
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => advanceR3.mutate()}
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
                <Button
                  size="sm"
                  onClick={() => assembleGF.mutate()}
                  disabled={assembleGF.isPending}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1" />
                  Assemble & Finalize Grand Final
                </Button>
              )}
            </>
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
          {/* Universal Stage Grid */}
          {activeRound && activeRound.groups.length > 0 ? (
            <div className="space-y-4">
              {isGrandFinalStage && (
                <GrandFinalAssemblyCard tournamentId={tournamentId} rounds={rounds} />
              )}
              <GroupStageGrid tournamentId={tournamentId} round={activeRound} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
              <Swords className="h-8 w-8 mx-auto text-foreground-muted/40 mb-2" />
              <h4 className="font-display font-semibold text-foreground">
                {isDynamicFormat ? `Stage ${currentStageIndex}` : activeStage.replace('_', ' ')} Not Generated Yet
              </h4>
              <p className="text-xs text-foreground-muted mt-1 max-w-md mx-auto">
                Click the &quot;Generate&quot; action button above once all conditions and prior rounds are satisfied.
              </p>
            </div>
          )}

          {/* Wild Card Manager for 5-stage setup */}
          {!isDynamicFormat && activeStage === 'WILDCARD' && (
            <WildCardManager
              tournamentId={tournamentId}
              isRound1Completed={isR1Completed}
            />
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
