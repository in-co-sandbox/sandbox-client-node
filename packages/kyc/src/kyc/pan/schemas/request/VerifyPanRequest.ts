import { z } from 'zod';

export const VerifyPanRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.pan_verification.request'),
        pan: z
            .string()
            .regex(new RegExp('^[A-Z]{5}[0-9]{4}[A-Z]{1}$'))
            .describe('Permanent Account Number to be verified against official PAN records.'),
        name_as_per_pan: z.string().min(2).describe('Full name of the PAN holder exactly as printed on the PAN card.'),
        date_of_birth: z
            .string()
            .regex(new RegExp('^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/([0-9]{4})$'))
            .describe('Date of birth or date of incorporation associated with the PAN in DD/MM/YYYY format.'),
        consent: z.enum(['Y', 'y']).describe('Explicit consent from the end user to retrieve and verify PAN details.'),
        reason: z.string().min(20).describe('Purpose for requesting PAN verification.'),
    })
    .strict();

export type VerifyPanRequest = z.infer<typeof VerifyPanRequestSchema>;
