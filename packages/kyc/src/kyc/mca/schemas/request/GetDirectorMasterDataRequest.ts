import { z } from 'zod';

export const GetDirectorMasterDataRequestSchema = z.object({
    id: z.string(),
    consent: z.string(),
    reason: z.string(),
    '"@entity"': z.string().optional(),
});

export type GetDirectorMasterDataRequest = z.infer<typeof GetDirectorMasterDataRequestSchema>;
