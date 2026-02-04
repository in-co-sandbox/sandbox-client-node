import { z } from 'zod';

export const VerifyOtpRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.aadhaar.okyc.request'),
    reference_id: z
        .string()
        .describe(
            'Unique reference identifier returned by the [Generate OTP API](https://developer.sandbox.co.in/api-reference/kyc/aadhaar/endpoints/generate_otp) for this Aadhaar verification flow. Used to correlate the OTP submission with the original request.',
        ),
    otp: z
        .string()
        .regex(new RegExp('[0-9]'))
        .min(6)
        .max(6)
        .describe(
            '6-digit one-time password sent to the mobile number linked with the Aadhaar. Must be entered exactly as received and is valid only for the associated reference_id.',
        ),
});

export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;
