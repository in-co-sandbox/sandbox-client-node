import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { AadhaarClient } from '../src/kyc/aadhaar/client/AadhaarClient';
import { GenerateOtpRequest } from '../src/kyc/aadhaar/schemas/request/GenerateOtpRequest';
import { VerifyOtpRequest } from '../src/kyc/aadhaar/schemas/request/VerifyOtpRequest';

describe('AadhaarClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.aadhaar.okyc.otp.request';
    const AADHAAR_NUMBER = '619040239388';
    const CONSENT = 'y';
    const REASON = 'commodo minim';
    const VERIFYOTP_ENTITY = 'in.co.sandbox.kyc.aadhaar.okyc.request';
    const REFERENCE_ID = 'dolore consequat aliquip do eu';
    const OTP = '983537';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: AadhaarClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new AadhaarClient(credentials);
    });

    describe('generateOTP', () => {
        it('should aadhaar offline e-kyc generate otp and return defined result', async () => {
            const request: GenerateOtpRequest = {
                '@entity': ENTITY,
                aadhaar_number: AADHAAR_NUMBER,
                consent: CONSENT,
                reason: REASON,
            };

            const result = await client.generateOTP(request);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('verifyOTP', () => {
        it('should aadhaar offline e-kyc verify otp and return defined result', async () => {
            const request: VerifyOtpRequest = {
                '@entity': VERIFYOTP_ENTITY,
                reference_id: REFERENCE_ID,
                otp: OTP,
            };

            const result = await client.verifyOTP(request);

            expect(result).toBeDefined();
        }, 30000);
    });
});
