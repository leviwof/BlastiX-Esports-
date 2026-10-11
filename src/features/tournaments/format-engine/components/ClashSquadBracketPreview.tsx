import React from 'react';
import type { CSKnockoutPlan, ValidFormatOption } from '../types/formatEngine.types';
import { Swords, Crown } from 'lucide-react';

interface ClashSquadBracketPreviewProps {
  format: ValidFormatOption;
}

export const ClashSquadBracketPreview: React.FC<ClashSquadBracketPreviewProps> = ({ format }) => {
  const csPlan: CSKnockoutPlan | undefined = format.csPlan;

  if (!csPlan) {
    return null;
  }

  return (
    <div
      data-testid="clash-squad-bracket-preview"
      className="space-y-4 rounded-xl border border-white/10 bg-[#0B0C10]/90 p-4.5 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-cyan-400">
            <Swords className="h-4 w-4" />
            <span>Clash Squad Knockout Bracket Architecture</span>
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400">
            Single-elimination 4v4 bracket spanning {csPlan.totalRounds} sequential knockout rounds ({csPlan.totalTeams} teams).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
            {format.totalMatches} Knockout Matches
          </span>
        </div>
      </div>

      {/* Bracket Rounds Progression */}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[500px] items-stretch gap-3">
          {csPlan.rounds.map((round, idx) => {
            const isFinal = idx === csPlan.rounds.length - 1;
            const isSemi = idx === csPlan.rounds.length - 2;

            return (
              <div
                key={round.roundNumber}
                className={`flex-1 min-w-[130px] rounded-xl border p-3.5 flex flex-col justify-between ${
                  isFinal
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,166,35,0.15)] ring-1 ring-amber-500/30'
                    : isSemi
                    ? 'border-cyan-500/30 bg-cyan-950/20'
                    : 'border-white/10 bg-[#12141D]/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
                      R{round.roundNumber}
                    </span>
                    {isFinal && (
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </div>

                  <h5 className="mt-1 font-display text-xs font-bold text-white truncate">
                    {round.roundName}
                  </h5>

                  <div className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Teams:</span>
                      <span className="font-bold text-white">{round.participatingTeams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Matches:</span>
                      <span className="font-semibold text-cyan-400">{round.matchesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Match Mock Representation */}
                <div className="mt-3 rounded border border-white/5 bg-black/40 p-1.5 text-center text-[10px] text-zinc-400">
                  {isFinal ? 'Winner Takes All' : `Winners advance (${round.matchesCount})`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
