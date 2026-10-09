import { useState } from 'react';
import { Trophy, AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FillFinalistSlotModal } from './FillFinalistSlotModal';
import { useAssembleGrandFinal } from '../hooks/useBracketEngine';
import type { TournamentRound } from '../types/brackets.types';

interface GrandFinalAssemblyCardProps {
  tournamentId: string;
  rounds: TournamentRound[];
}

export function GrandFinalAssemblyCard({ tournamentId, rounds }: GrandFinalAssemblyCardProps) {
  const [fillModalOpen, setFillModalOpen] = useState(false);
  const assembleGrandFinal = useAssembleGrandFinal(tournamentId);

  const r2 = rounds.find((r) => r.roundType === 'ROUND_2');
  const r3 = rounds.find((r) => r.roundType === 'ROUND_3');
  const gf = rounds.find((r) => r.roundType === 'GRAND_FINAL');

  // Extract qualified finalists
  const r2Finalists =
    r2?.qualifications?.filter((q) => q.destination === 'GRAND_FINAL') || [];
  const r3Finalists =
    r3?.qualifications?.filter((q) => q.destination === 'GRAND_FINAL') || [];
  const manualOverrides =
    rounds
      .flatMap((r) => r.qualifications || [])
      .filter((q) => q.destination === 'GRAND_FINAL' && q.isManualOverride) || [];

  // Deduplicate
  const allFinalistMap = new Map<string, { teamName: string; source: string; teamId: string }>();

  r2Finalists.forEach((q) => {
    allFinalistMap.set(q.tournamentTeamId, {
      teamId: q.tournamentTeamId,
      teamName: q.tournamentTeam?.name || 'Round 2 Finalist',
      source: 'Round 2 (Top 2)',
    });
  });

  r3Finalists.forEach((q) => {
    allFinalistMap.set(q.tournamentTeamId, {
      teamId: q.tournamentTeamId,
      teamName: q.tournamentTeam?.name || 'Round 3 Finalist',
      source: 'Round 3 (Top 3)',
    });
  });

  manualOverrides.forEach((q) => {
    allFinalistMap.set(q.tournamentTeamId, {
      teamId: q.tournamentTeamId,
      teamName: q.tournamentTeam?.name || 'Reserve Team',
      source: 'Special / Admin Pick',
    });
  });

  const finalists = Array.from(allFinalistMap.values());
  const currentCount = finalists.length;
  const isGfGenerated = Boolean(gf && gf.groups.length > 0);

  const handleAssemble = () => {
    assembleGrandFinal.mutate();
  };

  return (
    <div className="space-y-4">
      {/* Top Status & Summary Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0B0E14] p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                Grand Final Assembly (18 Teams)
              </h3>
              {isGfGenerated ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  ROSTER LOCKED & LIVE
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                  {currentCount}/18 FINALISTS READY
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted">
              8 from Round 2 + 9 from Round 3 + 1 Special/Reserve slot = 18 Teams Lobby.
            </p>
          </div>
        </div>

        {/* Assembly Action */}
        {!isGfGenerated && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFillModalOpen(true)}
              className="border-white/20 text-xs"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Fill Vacant Slot
            </Button>
            <Button
              size="sm"
              onClick={handleAssemble}
              disabled={assembleGrandFinal.isPending || currentCount !== 18}
              className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
            >
              <Trophy className="h-3.5 w-3.5 mr-1" />
              Lock & Generate Grand Final
            </Button>
          </div>
        )}
      </div>

      {/* Shortage Alert */}
      {!isGfGenerated && currentCount < 18 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Shortage Detected:</strong> {18 - currentCount} finalist slot(s) vacant.
              Click &quot;Fill Vacant Slot&quot; to pick an eligible reserve team before generating
              Grand Final.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setFillModalOpen(true)}
            className="h-7 text-xs bg-amber-400 text-black font-semibold hover:bg-amber-300"
          >
            + Fill Slot
          </Button>
        </div>
      )}

      {/* 18-Slot Finalists Grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 18 }, (_, idx) => {
          const finalist = finalists[idx];
          const slotNum = idx + 1;

          return (
            <div
              key={slotNum}
              className={`flex flex-col justify-between rounded-lg border p-3 min-h-[100px] transition-all ${
                finalist
                  ? 'border-[#11FBBE]/30 bg-gradient-to-b from-[#11FBBE]/5 to-transparent'
                  : 'border-dashed border-white/10 bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#11FBBE]">
                  #{String(slotNum).padStart(2, '0')}
                </span>
                {finalist && (
                  <span className="text-[9px] font-semibold text-foreground-muted truncate max-w-[80px]">
                    {finalist.source}
                  </span>
                )}
              </div>

              {finalist ? (
                <div className="mt-2">
                  <div className="font-display text-xs font-bold text-foreground truncate">
                    {finalist.teamName}
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center">
                  <span className="text-[11px] text-foreground-muted/50">Vacant Slot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FillFinalistSlotModal
        tournamentId={tournamentId}
        open={fillModalOpen}
        onClose={() => setFillModalOpen(false)}
        existingFinalistTeamIds={finalists.map((f) => f.teamId)}
      />
    </div>
  );
}
