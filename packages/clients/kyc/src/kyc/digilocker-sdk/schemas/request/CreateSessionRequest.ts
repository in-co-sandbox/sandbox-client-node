import { z } from 'zod';

export const CreateSessionRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.digilocker.sdk.session.request'),
        flow: z
            .enum(['signin', 'signup'])
            .describe(
                'DigiLocker authentication flow to initiate for the user. Use `signin` for existing DigiLocker users or `signup` to create a new account.',
            ),
        doc_types: z
            .array(z.enum(['aadhaar', 'driving_license', 'pan']))
            .min(1)
            .describe('List of DigiLocker document types for which user consent is being requested.'),
    })
    .strict();

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
