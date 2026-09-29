import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatEnum } from '@/lib/format';
import type { Proof } from '../proofs.types';

export interface ProofsTableProps {
  proofs: Proof[];
  onApprove: (proof: Proof) => void;
  onReject: (proof: Proof) => void;
  /** Open the embedded recording player for this proof. */
  onWatch: (proof: Proof) => void;
  /** Disable a row's actions while a mutation targeting it is in flight. */
  busyId?: string | null;
}

function statusVariant(status: string): 'warning' | 'danger' | 'success' | 'default' | 'secondary' {
  switch (status) {
    case 'PROOF_SUBMITTED':
      return 'warning';
    case 'PROOF_REJECTED':
      return 'danger';
    case 'COMPLETED':
      return 'success';
    case 'CLAIMED':
      return 'default';
    default:
      return 'secondary';
  }
}

/** Proof review queue — approve / reject actions on pending submissions. */
function ProofsTable({ proofs, onApprove, onReject, onWatch, busyId }: ProofsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-foreground-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Player</th>
            <th className="px-5 py-3 font-medium">Challenge</th>
            <th className="px-5 py-3 font-medium">Progress</th>
            <th className="px-5 py-3 font-medium">Submitted</th>
            <th className="px-5 py-3 font-medium">Proof</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {proofs.map((p) => {
            const busy = busyId === p.id;
            const pending = p.status === 'PROOF_SUBMITTED';
            return (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">
                  <span className="block font-medium text-foreground-soft">{p.user.name}</span>
                  <span className="block truncate text-xs text-foreground-muted">{p.user.email}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="block text-foreground-soft">{p.challenge.title}</span>
                  <span className="block text-xs text-foreground-muted">
                    {p.challenge.reward_xp.toLocaleString()} XP
                  </span>
                </td>
                <td className="px-5 py-3 text-foreground-muted">{p.current_progress}</td>
                <td className="px-5 py-3 text-foreground-muted">{formatDateTime(p.submitted_at)}</td>
                <td className="px-5 py-3">
                  {p.proof_url ? (
                    <Button variant="outline" size="sm" onClick={() => onWatch(p)}>
                      Watch Video
                    </Button>
                  ) : (
                    <span className="text-foreground-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={statusVariant(p.status)}>{formatEnum(p.status)}</Badge>
                </td>
                <td className="px-5 py-3">
                  {pending ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => onApprove(p)} disabled={busy}>
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onReject(p)}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-right text-xs text-foreground-muted">Reviewed</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { ProofsTable };
