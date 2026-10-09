import { useState, useEffect } from 'react';
import { Trophy, Swords, Calculator } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { useSubmitGroupScores } from '../hooks/useBracketEngine';
import type { TournamentGroup } from '../types/brackets.types';

interface MatchScoreEntryModalProps {
  tournamentId: string;
  group: TournamentGroup | null;
  open: boolean;
  onClose: () => void;
}

interface TeamScoreRow {
  tournamentTeamId: string;
  teamName: string;
  rank: number;
  kills: number;
}

const PLACEMENT_POINTS: Record<number, number> = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
};

export function MatchScoreEntryModal({
  tournamentId,
  group,
  open,
  onClose,
}: MatchScoreEntryModalProps) {
  const [rows, setRows] = useState<TeamScoreRow[]>([]);
  const submitScores = useSubmitGroupScores(tournamentId);

  useEffect(() => {
    if (group && group.groupTeams) {
      const initial: TeamScoreRow[] = group.groupTeams.map((gt, idx) => ({
        tournamentTeamId: gt.tournamentTeamId,
        teamName: gt.tournamentTeam?.name || `Team ${idx + 1}`,
        rank: gt.rank || idx + 1,
        kills: gt.kills || 0,
      }));
      setRows(initial);
    }
  }, [group]);

  if (!group) return null;

  const updateRow = (index: number, updates: Partial<TeamScoreRow>) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const handleSubmit = async () => {
    await submitScores.mutateAsync({
      groupId: group.id,
      payload: {
        scores: rows.map((r) => ({
          tournamentTeamId: r.tournamentTeamId,
          placement: r.rank,
          kills: r.kills,
        })),
      },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Enter Match Scores — ${group.name}`}
      description="Update kills and placements for all teams in this group. Total points will update standings automatically."
      className="max-w-2xl bg-[#0B0E14] border-white/10"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Calculator className="h-4 w-4 text-[#11FBBE]" />
            <span>Points = Kills (1 pt) + Placement (1st: 12, 2nd: 9, 3rd: 8...)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={submitScores.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitScores.isPending}
              className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
            >
              {submitScores.isPending ? 'Saving...' : 'Submit & Recalculate'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-foreground-muted">
              <th className="py-2.5 px-3 font-semibold">Team</th>
              <th className="py-2.5 px-3 font-semibold w-24">Placement</th>
              <th className="py-2.5 px-3 font-semibold w-28">Kills</th>
              <th className="py-2.5 px-3 font-semibold text-right w-24">Total Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => {
              const placementPts = PLACEMENT_POINTS[row.rank] ?? 0;
              const totalPts = placementPts + row.kills;

              return (
                <tr key={row.tournamentTeamId} className="hover:bg-white/[0.01]">
                  <td className="py-2 px-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-foreground-muted w-4">
                        #{idx + 1}
                      </span>
                      <span className="truncate">{row.teamName}</span>
                    </div>
                  </td>

                  {/* Placement Input */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-amber-400/70" />
                      <select
                        value={row.rank}
                        onChange={(e) => updateRow(idx, { rank: parseInt(e.target.value, 10) })}
                        className="w-14 rounded border border-white/10 bg-black/60 px-1.5 py-1 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((pos) => (
                          <option key={pos} value={pos} className="bg-[#0B0E14]">
                            #{pos}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Kills Stepper */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <Swords className="h-3 w-3 text-red-400/70" />
                      <input
                        type="number"
                        min={0}
                        value={row.kills}
                        onChange={(e) =>
                          updateRow(idx, { kills: Math.max(0, parseInt(e.target.value || '0', 10)) })
                        }
                        className="w-16 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
                      />
                    </div>
                  </td>

                  {/* Total Preview */}
                  <td className="py-2 px-3 text-right font-mono font-semibold text-[#11FBBE]">
                    {totalPts} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
