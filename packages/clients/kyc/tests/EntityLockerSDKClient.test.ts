import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in.co.sandbox/api-client-core';
import { EntityLockerSDKClient } from '../src/kyc/entitylocker-sdk/client/EntityLockerSDKClient';
import { CreateSessionRequest } from '../src/kyc/entitylocker-sdk/schemas/request/CreateSessionRequest';

describe('EntityLockerSDKClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.digilocker.sdk.session.request';
    const FLOW = 'signup';
    const DOC_TYPES = ['aadhaar', 'aadhaar'];
    const SESSIONID = 'non Lorem';
    const DOCTYPE = 'esse irure sit consectetur';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: EntityLockerSDKClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new EntityLockerSDKClient(credentials);
    });

    describe('createSession', () => {
        it('should create session and return defined result', async () => {
            const request: CreateSessionRequest = {
                '@entity': ENTITY,
                flow: FLOW,
                doc_types: DOC_TYPES,
            };

            const result = await client.createSession(request);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getSessionStatus', () => {
        it('should session status and return defined result', async () => {
            const sessionId = SESSIONID;

            const result = await client.getSessionStatus(sessionId);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getDocument', () => {
        it('should get document and return defined result', async () => {
            const sessionId = SESSIONID;
            const docType = DOCTYPE;

            const result = await client.getDocument(sessionId, docType);

            expect(result).toBeDefined();
        }, 30000);
    });
});
