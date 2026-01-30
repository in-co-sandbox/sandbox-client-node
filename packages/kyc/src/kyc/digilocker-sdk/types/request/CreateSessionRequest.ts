/**
 * CreateSession Request
 * Auto-generated - DO NOT EDIT
 */

export interface CreateSessionRequest {
    flow: 'signin' | 'signup';
    doc_types: 'aadhaar' | 'driving_license' | 'pan'[];
    '@entity': 'in.co.sandbox.kyc.digilocker.sdk.session.request';
}
