import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in.co.sandbox/api-client-core';
import { PANClient } from '../src/kyc/pan/client/PANClient';
import { VerifyPanRequest } from '../src/kyc/pan/schemas/request/VerifyPanRequest';
import { VerifyPanAadhaarLinkStatusRequest } from '../src/kyc/pan/schemas/request/VerifyPanAadhaarLinkStatusRequest';

describe('PANClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.pan_verification.request';
    const PAN = 'TXNNP7876Q';
    const NAME_AS_PER_PAN = 'Excepteur commodo ut consectetur eu';
    const DATE_OF_BIRTH = '17/09/5014';
    const CONSENT = 'Y';
    const REASON = 'exercitation veniam id nisi';
    const VERIFYPANAADHAARLINKSTATUS_ENTITY = 'in.co.sandbox.kyc.pan_aadhaar.status';
    const AADHAAR_NUMBER = '337112956939';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: PANClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new PANClient(credentials);
    });

    describe('verifyPAN', () => {
        it('should verify pan details and return defined result', async () => {
            const request: VerifyPanRequest = {
                '@entity': ENTITY,
                pan: PAN,
                name_as_per_pan: NAME_AS_PER_PAN,
                date_of_birth: DATE_OF_BIRTH,
                consent: CONSENT,
                reason: REASON,
            };
            const acceptCache = false;

            const result = await client.verifyPAN(request, acceptCache);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('verifyPANAadhaarLinkStatus', () => {
        it('should pan aadhaar link status and return defined result', async () => {
            const request: VerifyPanAadhaarLinkStatusRequest = {
                '@entity': VERIFYPANAADHAARLINKSTATUS_ENTITY,
                pan: PAN,
                aadhaar_number: AADHAAR_NUMBER,
                consent: CONSENT,
                reason: REASON,
            };

            const result = await client.verifyPANAadhaarLinkStatus(request);

            expect(result).toBeDefined();
        }, 30000);
    });
});
