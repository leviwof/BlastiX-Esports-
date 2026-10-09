import { useState } from 'react';
import { KeyRound, Copy, Check, Edit3, Shield, Trophy, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUpdateRoomCredentials } from '../hooks/useBracketEngine';
import type { TournamentGroup, TournamentRoundType } from '../types/brackets.types';

interface GroupCardProps {
  tournamentId: string;
  group: TournamentGroup;
  roundType: TournamentRoundType;
  onEnterScores: () => void;
}

export function GroupCard({
  tournamentId,
  group,
  roundType,
  onEnterScores,
}: GroupCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomId, setRoomId] = useState(group.roomId || '');
  const [roomPassword, setRoomPassword] = useState(group.roomPassword || '');

  const updateCredentials = useUpdateRoomCredentials(tournamentId);

  const handleCopyCredentials = () => {
    if (!group.roomId) {
      toast.error('No room credentials set yet.');
      return;
    }
    const text = `Room ID: ${group.roomId} | Password: ${group.roomPassword || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Room credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCredentials = async () => {
    await updateCredentials.mutateAsync({
      groupId: group.id,
      payload: {
        roomId,
        roomPassword,
        releaseNow: true,
      },
    });
    setIsEditingRoom(false);
  };

  const getRowHighlight = (rank: number) => {
    if (roundType === 'ROUND_1') {
      if (rank <= 6) return 'bg-emerald-500/5 text-emerald-300 font-semibold border-l-2 border-emerald-400';
      return 'opacity-50 text-foreground-muted';
    }

    if (roundType === 'ROUND_2') {
      if (rank <= 2) return 'bg-[#11FBBE]/10 text-[#11FBBE] font-semibold border-l-2 border-[#11FBBE]';
      if (rank <= 9) return 'bg-amber-500/10 text-amber-300 font-medium border-l-2 border-amber-400';
      return 'opacity-50 text-foreground-muted';
    }

    if (roundType === 'ROUND_3') {
      if (rank <= 3) return 'bg-[#11FBBE]/10 text-[#11FBBE] font-semibold border-l-2 border-[#11FBBE]';
      return 'opacity-50 text-foreground-muted';
    }

    // Grand final
    if (rank === 1) return 'bg-amber-500/10 text-amber-300 font-bold border-l-2 border-amber-400';
    if (rank <= 3) return 'bg-[#11FBBE]/10 text-[#11FBBE] font-semibold border-l-2 border-[#11FBBE]';
    return 'text-foreground-soft';
  };

  const getRankBadge = (rank: number) => {
    if (roundType === 'ROUND_1' && rank <= 6) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">
          To R2
        </span>
      );
    }
    if (roundType === 'ROUND_2') {
      if (rank <= 2) {
        return (
          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-semibold bg-[#11FBBE]/20 text-[#11FBBE]">
            <Trophy className="h-2.5 w-2.5" />
            Finalist
          </span>
        );
      }
      if (rank <= 9) {
        return (
          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-semibold bg-amber-500/20 text-amber-300">
            <Zap className="h-2.5 w-2.5" />
            To R3
          </span>
        );
      }
    }
    if (roundType === 'ROUND_3' && rank <= 3) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-semibold bg-[#11FBBE]/20 text-[#11FBBE]">
          <Trophy className="h-2.5 w-2.5" />
          Finalist
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-[#0B0E14] overflow-hidden shadow-xl transition-all duration-200 hover:border-white/20">
      {/* Group Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#11FBBE]" />
          <h3 className="font-display text-sm font-bold tracking-wide text-foreground">
            {group.name}
          </h3>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground-muted">
            {group.groupTeams.length} Teams
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onEnterScores}
          className="h-7 text-xs border-[#11FBBE]/40 text-[#11FBBE] hover:bg-[#11FBBE]/10"
        >
          <Edit3 className="h-3 w-3 mr-1" />
          Scores
        </Button>
      </div>

      {/* Room Details Bar */}
      <div className="border-b border-white/5 bg-black/40 p-2.5 text-xs">
        {isEditingRoom ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-1/2 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              className="w-1/2 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleSaveCredentials}
              disabled={updateCredentials.isPending}
              className="h-6 px-2 text-[10px] bg-[#11FBBE] text-black font-semibold"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingRoom(false)}
              className="h-6 px-1.5 text-[10px]"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground-muted">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {group.roomId ? (
                  <>
                    ID: <strong className="text-foreground">{group.roomId}</strong> | Pass:{' '}
                    <strong className="text-foreground">{group.roomPassword || 'None'}</strong>
                  </>
                ) : (
                  <span className="italic text-foreground-muted/60">No room published</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingRoom(true)}
                className="h-6 px-1.5 text-[10px] text-foreground-muted hover:text-foreground"
              >
                Edit
              </Button>
              {group.roomId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCredentials}
                  className="h-6 px-1.5 text-[10px] text-foreground-muted hover:text-foreground"
                >
                  {copied ? <Check className="h-3 w-3 text-[#11FBBE]" /> : <Copy className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standings Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] uppercase text-foreground-muted">
              <th className="py-1.5 px-2.5 w-8">#</th>
              <th className="py-1.5 px-2">Team</th>
              <th className="py-1.5 px-2 text-center w-12">Kills</th>
              <th className="py-1.5 px-2 text-center w-12">Place</th>
              <th className="py-1.5 px-2.5 text-right w-14">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {group.groupTeams.map((gt, idx) => {
              const rank = idx + 1;
              const badge = getRankBadge(rank);

              return (
                <tr key={gt.id} className={`transition-colors ${getRowHighlight(rank)}`}>
                  <td className="py-1.5 px-2.5 font-mono text-[11px] font-medium">
                    {rank}
                  </td>
                  <td className="py-1.5 px-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate max-w-[120px] sm:max-w-[140px] font-medium">
                        {gt.tournamentTeam?.name || 'Unnamed Team'}
                      </span>
                      {badge}
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono">
                    {gt.kills}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono text-foreground-muted">
                    {gt.placementPoints}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold">
                    {gt.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {group.groupTeams.length === 0 && (
        <div className="p-6 text-center text-xs text-foreground-muted">
          <AlertCircle className="h-5 w-5 mx-auto mb-1 text-foreground-muted/40" />
          No teams assigned to this group yet.
        </div>
      )}
    </div>
  );
}
