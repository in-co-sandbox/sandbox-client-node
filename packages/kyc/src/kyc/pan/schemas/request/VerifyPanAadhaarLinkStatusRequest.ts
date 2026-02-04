import { z } from 'zod';

export const VerifyPanAadhaarLinkStatusRequestSchema = z.object({
    pan: z.string(),
    aadhaar_number: z.string(),
    consent: z.string(),
    reason: z.string(),
    '"@entity"': z.string().optional(),
});

export type VerifyPanAadhaarLinkStatusRequest = z.infer<typeof VerifyPanAadhaarLinkStatusRequestSchema>;
