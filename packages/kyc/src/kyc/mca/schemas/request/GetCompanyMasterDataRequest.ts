import { z } from 'zod';

export const GetCompanyMasterDataRequestSchema = z.object({
    '@entity': z.string(),
    id: z.string(),
    consent: z.string(),
    reason: z.string(),
});

export type GetCompanyMasterDataRequest = z.infer<typeof GetCompanyMasterDataRequestSchema>;
