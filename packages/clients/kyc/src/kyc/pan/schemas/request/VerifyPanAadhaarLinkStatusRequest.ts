import { z } from 'zod';

export const VerifyPanAadhaarLinkStatusRequestSchema = z
    .object({
        '@entity': z.literal('in.co.sandbox.kyc.pan_aadhaar.status'),
        pan: z
            .string()
            .regex(new RegExp('^[A-Z]{5}[0-9]{4}[A-Z]{1}$'))
            .describe('Permanent Account Number to be verified against Aadhaar linkage records.'),
        aadhaar_number: z
            .string()
            .regex(new RegExp('^[0-9]{12}$'))
            .describe('12-digit Aadhaar number of the PAN holder used to validate PAN–Aadhaar linkage.'),
        consent: z
            .enum(['Y', 'y'])
            .describe('Explicit consent from the end user to retrieve and verify PAN and Aadhaar linkage information.'),
        reason: z.string().min(20).describe('Purpose for requesting PAN–Aadhaar verification.'),
    })
    .strict();

export type VerifyPanAadhaarLinkStatusRequest = z.infer<typeof VerifyPanAadhaarLinkStatusRequestSchema>;
