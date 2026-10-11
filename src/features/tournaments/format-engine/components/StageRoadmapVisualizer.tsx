import React from 'react';
import type { ValidFormatOption, BRStagePlan } from '../types/formatEngine.types';
import { MODE_CONFIG } from '../utils/formatEngineCalculator';
import {
  Swords,
  Users,
  ArrowRight,
  Flame,
  Shield,
  Crown,
} from 'lucide-react';

interface StageRoadmapVisualizerProps {
  format: ValidFormatOption;
}

export const StageRoadmapVisualizer: React.FC<StageRoadmapVisualizerProps> = ({ format }) => {
  const cfg = MODE_CONFIG[format.mode];
  const stages = format.stages;

  return (
    <div
      data-testid="stage-roadmap-visualizer"
      className="space-y-4 rounded-xl border border-white/10 bg-[#0B0C10]/90 p-4.5 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-white">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Tournament Progression Roadmap</span>
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400">
            Structured qualification flow from {format.capacityUnits} starting {cfg.unitName.toLowerCase()} down to the Grand Final champion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
            <Swords className="h-3 w-3" />
            <span>{format.totalMatches} Matches Total</span>
          </div>
        </div>
      </div>

      {/* Horizontal / Grid Stage Roadmap Flow */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stages.map((stage: BRStagePlan, idx: number) => {
          const isFinal = stage.isGrandFinal;
          const nextStage = stages[idx + 1];

          return (
            <div
              key={stage.stageNumber}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                isFinal
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-[#16120B] to-[#0E0E12] shadow-[0_0_20px_rgba(245,166,35,0.18)] ring-1 ring-amber-500/30'
                  : 'border-white/10 bg-[#12141D]/90 hover:border-white/20 hover:bg-[#151824]'
              }`}
            >
              <div>
                {/* Header: Stage Number & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                      isFinal ? 'text-amber-400' : 'text-cyan-400'
                    }`}
                  >
                    Stage {stage.stageNumber}
                  </span>
                  {isFinal ? (
                    <span className="flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                      <Crown className="h-3 w-3 text-amber-400" />
                      CHAMPIONSHIP
                    </span>
                  ) : (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                      ELIMINATION
                    </span>
                  )}
                </div>

                {/* Stage Title */}
                <h5 className="mt-1 font-display text-base font-bold text-white flex items-center gap-1.5">
                  {stage.stageName}
                </h5>

                {/* Metrics Breakdown */}
                <div className="mt-3 space-y-2 border-t border-white/5 pt-3 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      Active Field:
                    </span>
                    <span className="font-bold text-white">
                      {stage.totalUnits} {cfg.unitName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Shield className="h-3.5 w-3.5 text-cyan-400" />
                      Lobbies:
                    </span>
                    <span className="font-semibold text-cyan-300">
                      {stage.lobbyCount} {stage.lobbyCount === 1 ? 'Group' : 'Groups'} ({stage.unitsPerLobby} / lobby)
                    </span>
                  </div>

                  {!isFinal && (
                    <div className="flex items-center justify-between rounded bg-white/[0.03] p-1.5 text-zinc-300">
                      <span className="text-[11px] text-zinc-400">Advancement:</span>
                      <span className="font-bold text-emerald-400">
                        Top {stage.qualifiersPerLobby} per group ({stage.totalQualifiers} advance)
                      </span>
                    </div>
                  )}

                  {isFinal && (
                    <div className="rounded bg-amber-500/10 p-2 text-center text-[11px] font-bold text-amber-300 border border-amber-500/20">
                      🏆 1 Lobby · Booyah Points Decider
                    </div>
                  )}
                </div>
              </div>

              {/* Advancement Connector Arrow to Next Stage */}
              {nextStage && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-zinc-400">
                  <span className="truncate">Advances to {nextStage.stageName}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
