import { z } from 'zod';

export const GetCompanyMasterDataRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.mca.master_data.request'),
        id: z.string().min(7).max(21).describe('Government-issued identification code of the entity being verified.'),
        consent: z
            .enum(['Y', 'y'])
            .describe('Explicit consent from the end user to retrieve and verify entity information.'),
        reason: z.string().min(20).describe('Purpose for requesting verification of the entity’s information.'),
    })
    .strict();

export type GetCompanyMasterDataRequest = z.infer<typeof GetCompanyMasterDataRequestSchema>;
