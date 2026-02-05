import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { MCAClient } from '../src/kyc/mca/client/MCAClient';
import { GetCompanyMasterDataRequest } from '../src/kyc/mca/schemas/request/GetCompanyMasterDataRequest';
import { GetDirectorMasterDataRequest } from '../src/kyc/mca/schemas/request/GetDirectorMasterDataRequest';

describe('MCAClient', () => {
    // Test constants
    const ENTITY = 'in.co.sandbox.kyc.mca.master_data.request';
    const ID = '06523160';
    const CONSENT = 'Y';
    const REASON = 'quiDuis voluptateminim cillum ad';
    const GETDIRECTORMASTERDATA_ENTITY = 'in.co.sandbox.kyc.mca.master_data.request';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: MCAClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new MCAClient(credentials);
    });

    describe('getCompanyMasterData', () => {
        it('should company master data and return defined result', async () => {
            const request: GetCompanyMasterDataRequest = {
                '@entity': ENTITY,
                id: ID,
                consent: CONSENT,
                reason: REASON,
            };

            const result = await client.getCompanyMasterData(request);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('getDirectorMasterData', () => {
        it('should director master data and return defined result', async () => {
            const request: GetDirectorMasterDataRequest = {
                '@entity': GETDIRECTORMASTERDATA_ENTITY,
                id: ID,
                consent: CONSENT,
                reason: REASON,
            };

            const result = await client.getDirectorMasterData(request);

            expect(result).toBeDefined();
        }, 30000);
    });
});
