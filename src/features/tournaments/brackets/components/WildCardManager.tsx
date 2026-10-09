import { useState } from 'react';
import { Sparkles, Lock, Unlock, Plus, Trash2, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/shared/Modal';
import {
  useWildCardStatus,
  useOpenWildCard,
  useCloseWildCard,
  useAssignWildCardSlot,
  useRemoveWildCardSlot,
} from '../hooks/useBracketEngine';
import { useParticipants } from '@/features/tournaments/tournaments.hooks';
import type { WildCardSlot } from '../types/brackets.types';

interface WildCardManagerProps {
  tournamentId: string;
  isRound1Completed: boolean;
}

export function WildCardManager({ tournamentId, isRound1Completed }: WildCardManagerProps) {
  const { data: wildcardData } = useWildCardStatus(tournamentId);
  const { data: participants = [] } = useParticipants(tournamentId);

  const openWildCard = useOpenWildCard(tournamentId);
  const closeWildCard = useCloseWildCard(tournamentId);
  const assignSlot = useAssignWildCardSlot(tournamentId);
  const removeSlot = useRemoveWildCardSlot(tournamentId);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetSlotNumber, setTargetSlotNumber] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryFee, setEntryFee] = useState<number>(0);

  const windowStatus = wildcardData?.status || 'CLOSED';
  const slots: WildCardSlot[] = wildcardData?.slots || [];
  const filledCount = slots.length;

  const handleOpenAssign = (slotNumber: number) => {
    setTargetSlotNumber(slotNumber);
    setSearchTerm('');
    setAssignModalOpen(true);
  };

  const handleAssignTeam = async (teamId: string) => {
    await assignSlot.mutateAsync({
      slotNumber: targetSlotNumber,
      teamId,
    });
    setAssignModalOpen(false);
  };

  // Filter available teams from tournament participants not already assigned to wild card
  const assignedTeamIds = new Set(slots.map((s) => s.tournamentTeamId));
  const availableTeams = participants
    .filter((p) => p.team && !assignedTeamIds.has(p.team.id))
    .filter((p) =>
      p.team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.user?.name && p.user.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B0E14] p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#11FBBE]/30 bg-[#11FBBE]/10 text-[#11FBBE]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                Wild Card Stage (8 Slots)
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  windowStatus === 'OPEN'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-pulse'
                    : windowStatus === 'LOCKED'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                    : 'border-white/10 bg-white/5 text-foreground-muted'
                }`}
              >
                {windowStatus}
              </span>
            </div>
            <p className="text-xs text-foreground-muted">
              {filledCount === 8
                ? '⭐ All 8 Wild Card slots filled! Ready for Round 3 generation.'
                : `${filledCount} / 8 slots filled · ${8 - filledCount} slots vacant.`}
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-3">
          {windowStatus === 'OPEN' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => closeWildCard.mutate()}
              disabled={closeWildCard.isPending}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              Lock Wild Card
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-foreground-muted">Fee:</span>
                <input
                  type="number"
                  min={0}
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseInt(e.target.value || '0', 10))}
                  placeholder="0"
                  className="w-16 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-foreground focus:border-[#11FBBE] focus:outline-none"
                />
              </div>
              <Button
                size="sm"
                onClick={() => openWildCard.mutate({ entryFee })}
                disabled={openWildCard.isPending || !isRound1Completed}
                title={!isRound1Completed ? 'Round 1 must be COMPLETED before opening Wild Card' : ''}
                className="bg-[#11FBBE] text-black hover:bg-[#11FBBE]/90 font-semibold"
              >
                <Unlock className="h-3.5 w-3.5 mr-1" />
                Open Wild Card
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isRound1Completed && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          ⚠️ <strong>Notice:</strong> Wild Card registration can only be opened after Round 1 matches are finalized and Round 1 is marked COMPLETED.
        </div>
      )}

      {/* 8-Slot Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, idx) => {
          const slotNum = idx + 1;
          const slot = slots.find((s) => s.slotNumber === slotNum);

          return (
            <div
              key={slotNum}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                slot
                  ? 'border-[#11FBBE]/30 bg-gradient-to-b from-[#11FBBE]/5 to-transparent shadow-lg'
                  : 'border-dashed border-white/10 bg-white/[0.01] hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#11FBBE]">
                    Slot #0{slotNum}
                  </span>
                  {slot && (
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        slot.isManualAdminSlot
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-[#11FBBE]/20 text-[#11FBBE]'
                      }`}
                    >
                      {slot.isManualAdminSlot ? 'Admin Assigned' : 'Registered'}
                    </span>
                  )}
                </div>

                {slot ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#11FBBE] shrink-0" />
                      <span className="font-display text-sm font-bold text-foreground truncate">
                        {slot.tournamentTeam?.name || 'Assigned Team'}
                      </span>
                    </div>
                    {slot.tournamentTeam?.captain && (
                      <div className="mt-1 text-xs text-foreground-muted">
                        Captain: {slot.tournamentTeam.captain.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-6 text-center">
                    <span className="text-xs text-foreground-muted/60">Vacant Slot</span>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              <div className="mt-3 border-t border-white/5 pt-2">
                {slot ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSlot.mutate(slotNum)}
                    disabled={removeSlot.isPending}
                    className="h-7 w-full text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove Team
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAssign(slotNum)}
                    className="h-7 w-full text-xs border-dashed border-white/20 text-foreground hover:border-[#11FBBE] hover:text-[#11FBBE]"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Assign Team
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Selection Modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Team to Wild Card Slot #${targetSlotNumber}`}
        description="Select a registered tournament team to fill this Wild Card slot."
        className="max-w-md bg-[#0B0E14] border-white/10"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search team name or captain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-[#11FBBE] focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 rounded-lg border border-white/5 bg-black/40">
            {availableTeams.map((p) => (
              <button
                key={p.team?.id || p.id}
                type="button"
                onClick={() => p.team && handleAssignTeam(p.team.id)}
                disabled={assignSlot.isPending}
                className="flex w-full items-center justify-between p-2.5 text-left text-xs transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <div className="font-semibold text-foreground">{p.team?.name}</div>
                  <div className="text-[11px] text-foreground-muted">Captain: {p.user?.name || 'Unknown'}</div>
                </div>
                <Button size="sm" className="h-6 text-[10px] bg-[#11FBBE] text-black font-semibold">
                  Select
                </Button>
              </button>
            ))}

            {availableTeams.length === 0 && (
              <div className="p-4 text-center text-xs text-foreground-muted">
                No eligible unassigned teams found.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
