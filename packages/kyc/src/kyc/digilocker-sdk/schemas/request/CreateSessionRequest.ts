import { z } from 'zod';

export const CreateSessionRequestSchema = z.object({
    flow: z.enum(['signin', 'signup']).describe('Indicates whether the user is signing in or signing up on DigiLocker'),
    doc_types: z.array(z.enum(['aadhaar', 'driving_license', 'pan'])).describe('Documents you need consent for.'),
    '"@entity"': z.literal('in.co.sandbox.kyc.digilocker.sdk.session.request').optional(),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
