import { z } from 'zod';

export const InitiateSessionRequestSchema = z.object({
    '@entity': z.literal('in.co.sandbox.kyc.digilocker.session.request'),
    flow: z
        .enum(['signin', 'signup'])
        .describe(
            'Authentication flow to initiate on DigiLocker. Use `signin` for existing users or `signup` to create a new DigiLocker account.',
        ),
    redirect_url: z
        .string()
        .url()
        .regex(new RegExp('^https://'))
        .describe(
            'HTTPS URL where the user will be redirected after granting or denying DigiLocker consent. Must be a valid, publicly accessible URL.',
        ),
    doc_types: z
        .array(z.enum(['aadhaar', 'pan', 'driving_license']))
        .min(1)
        .describe('List of DigiLocker document types for which user consent is being requested.'),
    options: z
        .object({
            verification_method: z
                .array(z.enum(['aadhaar', 'pan', 'driving_license', 'email', 'username', 'mobile', 'other']))
                .min(1)
                .describe('Verification methods allowed during DigiLocker sign-up.')
                .optional(),
            pinless: z
                .boolean()
                .describe(
                    'Allow users to sign in using OTP without entering a DigiLocker PIN. Applicable only for the `signin` flow.',
                )
                .optional(),
            usernameless: z
                .boolean()
                .describe(
                    'Allow users to skip username creation during DigiLocker sign-up. Applicable only for the `signup` flow.',
                )
                .optional(),
            verified_mobile: z
                .string()
                .regex(new RegExp('^[6-9][0-9]{9}$'))
                .describe('Mobile number already verified by your system to skip DigiLocker mobile OTP during sign-up.')
                .optional(),
        })
        .describe('Configuration object controlling the DigiLocker authentication and sign-up user experience.')
        .optional(),
    consent_expiry: z
        .number()
        .int()
        .describe(
            'Unix epoch timestamp (milliseconds) after which the consent request expires. Must be at least 1 hour in the future.',
        )
        .optional(),
});

export type InitiateSessionRequest = z.infer<typeof InitiateSessionRequestSchema>;
