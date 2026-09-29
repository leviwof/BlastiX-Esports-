import { z } from 'zod';

/** Reject-proof form: a required reason, max 500 chars (mirrors RejectProofDto). */
export const rejectProofSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'A reason is required.')
    .max(500, 'Keep the reason under 500 characters.'),
});

export type RejectProofFormValues = z.infer<typeof rejectProofSchema>;
