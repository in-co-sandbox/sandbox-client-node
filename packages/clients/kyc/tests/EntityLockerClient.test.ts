import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { EntityLockerClient } from '../src/kyc/entitylocker/client/EntityLockerClient';
import { InitiateSessionRequest } from '../src/kyc/entitylocker/schemas/request/InitiateSessionRequest';

describe('EntityLockerClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.entitylocker.session.request';
    const FLOW = 'signin';
    const REDIRECT_URL = 'https://developer.sandbox.co.in/';
    const CONSENT_EXPIRY = 1770302340000;
    const SESSIONID = 'a55fd008-51a6-4486-8b96-f09e1a72403a';
    const DOCTYPE = 'company_master_details';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: EntityLockerClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new EntityLockerClient(credentials);
    });

    describe('initiateSession', () => {
        it('should initiate session and return defined result', async () => {
            const request: InitiateSessionRequest = {
                '@entity': ENTITY,
                flow: FLOW,
                redirect_url: REDIRECT_URL,
                consent_expiry: CONSENT_EXPIRY,
            };

            const result = await client.initiateSession(request);

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

    describe('getEntityDetails', () => {
        it('should get entity details and return defined result', async () => {
            const sessionId = SESSIONID;

            const result = await client.getEntityDetails(sessionId);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getUserDetails', () => {
        it('should get user profile details and return defined result', async () => {
            const sessionId = SESSIONID;

            const result = await client.getUserDetails(sessionId);

            expect(result).toBeDefined();
        }, 30000);
    });
});
