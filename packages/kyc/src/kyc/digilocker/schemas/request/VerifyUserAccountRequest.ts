import { z } from 'zod';

export const VerifyUserAccountRequestSchema = z
    .object({
        aadhaar_number: z.string().optional(),
        mobile: z.string().optional(),
        '"@entity"': z.literal('in.co.sandbox.kyc.digilocker.user.verification.request').optional(),
    })
    .and(z.union([z.any(), z.any()]));

export type VerifyUserAccountRequest = z.infer<typeof VerifyUserAccountRequestSchema>;
