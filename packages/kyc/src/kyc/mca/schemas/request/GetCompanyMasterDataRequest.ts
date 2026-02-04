import { z } from 'zod';

export const GetCompanyMasterDataRequestSchema = z.object({
    id: z.string(),
    consent: z.string(),
    reason: z.string(),
    '"@entity"': z.string().optional(),
});

export type GetCompanyMasterDataRequest = z.infer<typeof GetCompanyMasterDataRequestSchema>;
