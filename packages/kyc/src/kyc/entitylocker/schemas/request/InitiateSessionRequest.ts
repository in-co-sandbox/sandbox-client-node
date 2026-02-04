import { z } from 'zod';

export const InitiateSessionRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.entitylocker.session.request'),
    flow: z
        .enum(['signin', 'signup'])
        .describe(
            'EntityLocker user journey to initiate for this session. Use `signin` for existing users or `signup` to create a new EntityLocker account.',
        ),
    redirect_url: z
        .string()
        .url()
        .regex(new RegExp('^https://'))
        .describe('HTTPS URL where the user will be redirected after completing the EntityLocker consent flow.'),
    consent_expiry: z
        .number()
        .int()
        .gte(0)
        .describe(
            'Unix timestamp in milliseconds after which the consent request becomes invalid. Must be at least 1 hour later than the current server time.',
        )
        .optional(),
});

export type InitiateSessionRequest = z.infer<typeof InitiateSessionRequestSchema>;
