import { z } from 'zod';

export const GenerateOtpRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.aadhaar.okyc.otp.request'),
    aadhaar_number: z
        .string()
        .regex(new RegExp('^[0-9]{12}$'))
        .min(12)
        .max(12)
        .describe(
            '12-digit Aadhaar number of the individual for whom the OTP will be generated. Must contain exactly 12 numeric digits with no spaces or separators.',
        ),
    consent: z
        .enum(['Y', 'y'])
        .describe(
            'Explicit consent from the end user to use their Aadhaar details for OTP-based verification. Must be passed as "Y" or "y" to proceed.',
        ),
    reason: z
        .string()
        .describe(
            'Purpose for initiating Aadhaar OTP verification, such as identity verification or KYC compliance. Used for audit, compliance, and request traceability.',
        ),
});

export type GenerateOtpRequest = z.infer<typeof GenerateOtpRequestSchema>;
