import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { EntityLockerSDKClient } from '../src/kyc/entitylocker-sdk/client/EntityLockerSDKClient';
import { CreateSessionRequest } from '../src/kyc/entitylocker-sdk/schemas/request/CreateSessionRequest';

describe('EntityLockerSDKClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.entitylocker.sdk.session.request' as const;
    const FLOW = 'signup' as const;
    const DOC_TYPES = ['company_master_details', 'gstn_details'] as ('company_master_details' | 'gstn_details')[];
    const SESSIONID = 'non Lorem';
    const DOCTYPE = 'gstn_details' as const;

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
