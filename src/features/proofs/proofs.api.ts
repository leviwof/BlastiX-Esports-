import { apiClient } from '@/lib/apiClient';
import type { ListProofsQuery, Proof, ProofPage, RejectProofPayload } from './proofs.types';

/**
 * Proof-review API. `approve` is a no-body POST, so it sends `{}` explicitly —
 * the strict backend ValidationPipe rejects a missing body. The response
 * envelope is unwrapped by the apiClient interceptor.
 */

function cleanParams(query: ListProofsQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number;
    }
  }
  return out;
}

/** GET /admin/proofs — review queue (defaults to PROOF_SUBMITTED server-side). */
export async function listProofs(query: ListProofsQuery = {}): Promise<ProofPage> {
  const response = await apiClient.get<ProofPage>('/admin/proofs', { params: cleanParams(query) });
  return response.data;
}

/** POST /admin/proofs/:id/approve — grant the reward (no body). */
export async function approveProof(id: string): Promise<Proof> {
  const response = await apiClient.post<Proof>(`/admin/proofs/${id}/approve`, {});
  return response.data;
}

/** POST /admin/proofs/:id/reject — reject with a required reason. */
export async function rejectProof(id: string, body: RejectProofPayload): Promise<Proof> {
  const response = await apiClient.post<Proof>(`/admin/proofs/${id}/reject`, body);
  return response.data;
}
