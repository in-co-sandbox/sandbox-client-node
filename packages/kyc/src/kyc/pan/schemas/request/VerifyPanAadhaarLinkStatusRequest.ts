import { z } from 'zod';

export const VerifyPanAadhaarLinkStatusRequestSchema = z.object({
    '@entity': z.string(),
    pan: z.string(),
    aadhaar_number: z.string(),
    consent: z.string(),
    reason: z.string(),
});

export type VerifyPanAadhaarLinkStatusRequest = z.infer<typeof VerifyPanAadhaarLinkStatusRequestSchema>;
