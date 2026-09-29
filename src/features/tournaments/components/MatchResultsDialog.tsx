import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRecordMatchResults } from '../tournaments.hooks';
import type { Match, TournamentRegistration } from '../tournaments.types';

export interface MatchResultsDialogProps {
  tournamentId: string;
  /** The match to record results for; the dialog is open while this is set. */
  match: Match | null;
  participants: TournamentRegistration[];
  onClose: () => void;
}

interface RowInput {
  placement: string;
  kills: string;
}

const participantName = (p: TournamentRegistration): string =>
  p.user?.name ?? p.team?.name ?? `Slot ${p.slot_number}`;

/**
 * Bulk-record placement + kills for each confirmed participant of a match.
 * Rows left blank are skipped; only participants with a placement are sent.
 */
function MatchResultsDialog({ tournamentId, match, participants, onClose }: MatchResultsDialogProps) {
  const [rows, setRows] = useState<Record<string, RowInput>>({});
  const [error, setError] = useState<string>();
  const recordResults = useRecordMatchResults(tournamentId);

  // Only confirmed registrations can receive results.
  const confirmed = useMemo(
    () => participants.filter((p) => p.status === 'CONFIRMED'),
    [participants],
  );

  // Rebuild the input rows whenever a different match is opened, pre-filling
  // any results already recorded for it.
  useEffect(() => {
    if (!match) return;
    const existing = new Map(
      (match.results ?? []).map((r) => [r.registration_id, r] as const),
    );
    const next: Record<string, RowInput> = {};
    for (const p of confirmed) {
      const prev = existing.get(p.id);
      next[p.id] = {
        placement: prev ? String(prev.placement) : '',
        kills: prev ? String(prev.kills) : '',
      };
    }
    setRows(next);
    setError(undefined);
  }, [match, confirmed]);

  const setRow = (id: string, key: keyof RowInput, value: string) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const handleSubmit = () => {
    const results: { registration_id: string; placement: number; kills: number }[] = [];
    for (const p of confirmed) {
      const row = rows[p.id];
      if (!row || row.placement.trim() === '') continue; // skip untouched rows
      const placement = Number(row.placement);
      const kills = row.kills.trim() === '' ? 0 : Number(row.kills);
      if (!Number.isInteger(placement) || placement < 1) {
        setError(`Enter a valid placement (1 or higher) for ${participantName(p)}.`);
        return;
      }
      if (!Number.isInteger(kills) || kills < 0) {
        setError(`Enter valid kills (0 or higher) for ${participantName(p)}.`);
        return;
      }
      results.push({ registration_id: p.id, placement, kills });
    }

    if (results.length === 0) {
      setError('Enter a placement for at least one participant.');
      return;
    }

    setError(undefined);
    recordResults.mutate({ matchId: match!.id, body: { results } }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={Boolean(match)}
      onClose={onClose}
      title={match ? `Record results — Match ${match.match_number}` : 'Record results'}
      description="Enter each participant's finishing placement and kill count. Leave a row blank to skip it."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={recordResults.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={recordResults.isPending}>
            {recordResults.isPending ? 'Saving…' : 'Save results'}
          </Button>
        </>
      }
    >
      {confirmed.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          No confirmed participants to record results for.
        </p>
      ) : (
        <div className="space-y-3">
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
          <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface text-left text-xs text-foreground-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Participant</th>
                  <th className="w-28 px-3 py-2 font-medium">Placement</th>
                  <th className="w-24 px-3 py-2 font-medium">Kills</th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground-soft">
                      <span className="block truncate">{participantName(p)}</span>
                      {p.team?.tag && (
                        <span className="text-xs text-foreground-muted">[{p.team.tag}]</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        aria-label={`Placement for ${participantName(p)}`}
                        value={rows[p.id]?.placement ?? ''}
                        onChange={(e) => setRow(p.id, 'placement', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        aria-label={`Kills for ${participantName(p)}`}
                        value={rows[p.id]?.kills ?? ''}
                        onChange={(e) => setRow(p.id, 'kills', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

export { MatchResultsDialog };
