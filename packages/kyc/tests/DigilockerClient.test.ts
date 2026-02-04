import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in.co.sandbox/api-client-core';
import { DigilockerClient } from '../src/kyc/digilocker/client/DigilockerClient';
import { InitiateSessionRequest } from '../src/kyc/digilocker/schemas/request/InitiateSessionRequest';

describe('DigilockerClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.digilocker.session.request';
    const FLOW = 'signup';
    const REDIRECT_URL = 'https://developer.sandbox.co.in/';
    const DOC_TYPES: ('driving_license' | 'pan' | 'aadhaar')[] = ['driving_license'];
    const OPTIONS = {
        verification_method: ['other', 'username', 'pan'] as (
            | 'driving_license'
            | 'pan'
            | 'aadhaar'
            | 'other'
            | 'username'
            | 'email'
            | 'mobile'
        )[],
        pinless: true,
        usernameless: false,
        verified_mobile: '6732776768',
    };
    const CONSENT_EXPIRY = 1770302340000;
    const SESSIONID = '71e09caf-e8ff-435e-9054-9d027c5abcd6';
    const DOCTYPE = 'aadhaar';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: DigilockerClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new DigilockerClient(credentials);
    });

    describe('initiateSession', () => {
        it('should initiate session and return defined result', async () => {
            const request: InitiateSessionRequest = {
                '@entity': ENTITY,
                flow: FLOW,
                redirect_url: REDIRECT_URL,
                doc_types: DOC_TYPES,
                options: OPTIONS,
                consent_expiry: CONSENT_EXPIRY,
            };

            const result = await client.initiateSession(request);
            console.log(result);
            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getSessionStatus', () => {
        it('should get session status and return defined result', async () => {
            const sessionId = SESSIONID;

            const result = await client.getSessionStatus(sessionId);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getDocument', () => {
        it('should fetch document and return defined result', async () => {
            const sessionId = SESSIONID;
            const docType = DOCTYPE;

            const result = await client.getDocument(sessionId, docType);
            expect(result).toBeDefined();
        }, 30000);
    });
});
