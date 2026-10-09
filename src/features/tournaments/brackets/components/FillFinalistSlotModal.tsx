import { useState } from 'react';
import { Search, Trophy } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { useFillGrandFinalSlot } from '../hooks/useBracketEngine';
import { useParticipants } from '@/features/tournaments/tournaments.hooks';

interface FillFinalistSlotModalProps {
  tournamentId: string;
  open: boolean;
  onClose: () => void;
  existingFinalistTeamIds: string[];
}

export function FillFinalistSlotModal({
  tournamentId,
  open,
  onClose,
  existingFinalistTeamIds,
}: FillFinalistSlotModalProps) {
  const { data: participants = [] } = useParticipants(tournamentId);
  const fillSlot = useFillGrandFinalSlot(tournamentId);

  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('Admin Grand Final reserve override');

  const finalistSet = new Set(existingFinalistTeamIds);
  const availableTeams = participants
    .filter((p) => p.team && !finalistSet.has(p.team.id))
    .filter(
      (p) =>
        p.team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.user?.name && p.user.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  const handleSelectTeam = async (teamId: string) => {
    await fillSlot.mutateAsync({
      teamId,
      reason,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fill Grand Final Reserve Slot"
      description="Select any tournament team to fill the vacant 18th Grand Final finalist slot."
      className="max-w-md bg-[#0B0E14] border-white/10"
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-foreground-muted mb-1 block">Override Reason / Note</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Special invite or replacement slot"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search teams or captains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-[#11FBBE] focus:outline-none"
          />
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-white/5 rounded-lg border border-white/5 bg-black/40">
          {availableTeams.map((p) => (
            <button
              key={p.team?.id || p.id}
              type="button"
              onClick={() => p.team && handleSelectTeam(p.team.id)}
              disabled={fillSlot.isPending}
              className="flex w-full items-center justify-between p-3 text-left text-xs transition-colors hover:bg-white/[0.04]"
            >
              <div>
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  {p.team?.name}
                </div>
                <div className="text-[11px] text-foreground-muted mt-0.5">
                  Captain: {p.user?.name || 'Unknown'}
                </div>
              </div>
              <Button size="sm" className="h-6 text-[10px] bg-[#11FBBE] text-black font-semibold">
                Promote to Final
              </Button>
            </button>
          ))}

          {availableTeams.length === 0 && (
            <div className="p-4 text-center text-xs text-foreground-muted">
              No eligible teams available.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
