import { z } from 'zod';

export const VerifyPanRequestSchema = z.object({
    pan: z.string(),
    name_as_per_pan: z.string(),
    date_of_birth: z.string(),
    consent: z.string(),
    reason: z.string(),
    '"@entity"': z.string().optional(),
});

export type VerifyPanRequest = z.infer<typeof VerifyPanRequestSchema>;
