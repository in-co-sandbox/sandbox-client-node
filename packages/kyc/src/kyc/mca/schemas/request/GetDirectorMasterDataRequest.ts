import { z } from 'zod';

export const GetDirectorMasterDataRequestSchema = z.object({
    '@entity': z.string(),
    id: z.string(),
    consent: z.string(),
    reason: z.string(),
});

export type GetDirectorMasterDataRequest = z.infer<typeof GetDirectorMasterDataRequestSchema>;
