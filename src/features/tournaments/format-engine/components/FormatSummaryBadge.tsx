import React from 'react';
import type { ValidFormatOption } from '../types/formatEngine.types';
import { MODE_CONFIG } from '../utils/formatEngineCalculator';
import { Trophy, Swords, Layers, ShieldCheck } from 'lucide-react';

interface FormatSummaryBadgeProps {
  format: ValidFormatOption;
  compact?: boolean;
}

export const FormatSummaryBadge: React.FC<FormatSummaryBadgeProps> = ({
  format,
  compact = false,
}) => {
  const cfg = MODE_CONFIG[format.mode];

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs">
        <span className="font-display font-bold text-amber-400">{cfg.label}</span>
        <span className="text-zinc-500">•</span>
        <span className="font-semibold text-zinc-300">
          {format.capacityUnits} {cfg.unitName}
        </span>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-400">{format.totalRounds} Stages</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-surface-2/90 via-[#10141D] to-surface-2/90 p-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.15)]">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
              {cfg.label} Tournament Architecture
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-3 w-3" />
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {format.capacityUnits} {cfg.unitName} total capacity across {format.totalRounds} elimination stages
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-zinc-400">Stages:</span>
          <span className="font-bold text-white">{format.totalRounds}</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5">
          <Swords className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-zinc-400">Total Matches:</span>
          <span className="font-bold text-white">{format.totalMatches}</span>
        </div>
      </div>
    </div>
  );
};
