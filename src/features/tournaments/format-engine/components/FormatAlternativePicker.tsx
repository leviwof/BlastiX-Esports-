import React from 'react';
import type { ValidFormatOption } from '../types/formatEngine.types';
import { Layers, CheckCircle2 } from 'lucide-react';

interface FormatAlternativePickerProps {
  alternatives: ValidFormatOption[];
  selectedFormatId: string;
  onSelectFormat: (format: ValidFormatOption) => void;
}

export const FormatAlternativePicker: React.FC<FormatAlternativePickerProps> = ({
  alternatives,
  selectedFormatId,
  onSelectFormat,
}) => {
  if (alternatives.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-surface-2/40 p-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>Available Qualification Structures ({alternatives.length} Paths)</span>
        </label>
        <span className="text-[11px] text-zinc-400">Select preferred stage pacing</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {alternatives.map((opt, index) => {
          const isSelected = opt.formatId === selectedFormatId;

          return (
            <button
              key={opt.formatId}
              type="button"
              onClick={() => onSelectFormat(opt)}
              className={`flex items-start justify-between rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_12px_rgba(245,166,35,0.2)] text-white'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">
                    {opt.totalRounds} Stages ({opt.totalMatches} Matches)
                  </span>
                  {index === 0 && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {opt.stages.map((s) => `${s.lobbyCount}L`).join(' → ')}
                </p>
              </div>

              {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
