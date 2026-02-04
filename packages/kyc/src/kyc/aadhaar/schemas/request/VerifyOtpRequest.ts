import { z } from 'zod';

export const VerifyOtpRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.aadhaar.okyc.request'),
    reference_id: z.string().describe('Reference ID received in the Generate OTP response'),
    otp: z
        .string()
        .regex(new RegExp('[0-9]'))
        .min(6)
        .max(6)
        .describe('OTP generated to mobile number associated with Aadhaar'),
});

export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;
