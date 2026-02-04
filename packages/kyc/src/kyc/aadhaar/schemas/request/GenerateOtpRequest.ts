import { z } from 'zod';

export const GenerateOtpRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.aadhaar.okyc.otp.request'),
    aadhaar_number: z
        .string()
        .regex(new RegExp('[0-9]'))
        .min(12)
        .max(12)
        .describe('12-digit number issued by the UIDAI'),
    consent: z.enum(['Y', 'y']).describe('Consent of the end-user to get their information for verification purposes.'),
    reason: z.string().describe('Indicate the purpose for verification.'),
});

export type GenerateOtpRequest = z.infer<typeof GenerateOtpRequestSchema>;
