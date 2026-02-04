import { z } from 'zod';

export const GetDirectorMasterDataRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.mca.master_data.request'),
        id: z
            .string()
            .regex(new RegExp('^[0-9]{8}$'))
            .describe(
                '8-digit Director Identification Number (DIN) issued by the central government to an individual appointed as a company director.',
            ),
        consent: z
            .enum(['Y', 'y'])
            .describe('Explicit consent from the end user to retrieve and verify the director’s information.'),
        reason: z.string().min(20).describe('Purpose for requesting verification of the director’s information.'),
    })
    .strict();

export type GetDirectorMasterDataRequest = z.infer<typeof GetDirectorMasterDataRequestSchema>;
