import { z } from 'zod';

export const CreateSessionRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.entitylocker.sdk.session.request'),
        flow: z
            .enum(['signin', 'signup'])
            .describe(
                'EntityLocker authentication flow to initiate for the user. Use `signin` for existing EntityLocker users or `signup` to create a new account.',
            ),
        doc_types: z
            .array(z.enum(['company_master_details', 'gstn_details', 'udhyam_certificate ']))
            .min(1)
            .describe('List of EntityLocker document types for which user consent is being requested.'),
    })
    .strict();

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
