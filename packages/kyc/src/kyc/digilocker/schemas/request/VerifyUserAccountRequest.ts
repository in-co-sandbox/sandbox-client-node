import { z } from 'zod';

export const VerifyUserAccountRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.digilocker.user.verification.request'),
        aadhaar_number: z.string().optional(),
        mobile: z.string().optional(),
    })
    .and(z.union([z.any(), z.any()]));

export type VerifyUserAccountRequest = z.infer<typeof VerifyUserAccountRequestSchema>;
