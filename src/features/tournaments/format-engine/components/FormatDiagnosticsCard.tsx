import React from 'react';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface FormatDiagnosticsCardProps {
  failureReason?: string;
  violations?: string[];
  suggestedCapacities?: number[];
  unitName?: string;
  onSelectCapacity: (capacity: number) => void;
}

export const FormatDiagnosticsCard: React.FC<FormatDiagnosticsCardProps> = ({
  failureReason,
  violations = [],
  suggestedCapacities = [],
  unitName = 'Teams',
  onSelectCapacity,
}) => {
  return (
    <div
      data-testid="format-diagnostics-card"
      className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-[#12131A] to-[#0B0C10] p-4.5 shadow-[0_0_20px_rgba(244,63,94,0.12)] transition-all animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-rose-400">
                Invalid Format Configuration
              </span>
              <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/20">
                LOBBY MISMATCH
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300 font-medium">
              {failureReason ||
                `The specified capacity cannot be partitioned into valid competitive lobbies.`}
            </p>
          </div>

          {violations.length > 0 && (
            <div className="space-y-1 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Rule Violations:
              </span>
              <ul className="space-y-1 text-xs text-zinc-400">
                {violations.map((violation, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{violation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestedCapacities.length > 0 && (
            <div className="pt-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Recommended Valid Alternatives (Click to Apply):</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedCapacities.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => onSelectCapacity(cap)}
                    className="group relative inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,166,35,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>
                      {cap} {unitName}
                    </span>
                    <ArrowRight className="h-3 w-3 text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
