import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in.co.sandbox/api-client-core';
import { BankClient } from '../src/kyc/bank/client/BankClient';

describe('BankClient', () => {
    // Test constants
    const IFSC = 'velit tempor Duis';
    const ACCOUNTNUMBER = 'in quis mollit laboris';
    const NAME = 'laborum eu cupidatat Duis do';
    const MOBILE = 'ad';

    // API Credentials - Replace with actual values
    const API_KEY = '';
    const API_SECRET = '';

    let client: BankClient;

    beforeEach(() => {
        const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
        client = new BankClient(credentials);
    });

    describe('verifyIFSC', () => {
        it('should ifsc verification and return defined result', async () => {
            const ifsc = IFSC;

            const result = await client.verifyIFSC(ifsc);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('verifyBankUsingPennyDrop', () => {
        it('should bank account verification [penny-drop] and return defined result', async () => {
            const ifsc = IFSC;
            const accountNumber = ACCOUNTNUMBER;
            const name = NAME;
            const mobile = MOBILE;
            const acceptCache = false;

            const result = await client.verifyBankUsingPennyDrop(ifsc, accountNumber, name, mobile, acceptCache);

            expect(result).toBeDefined();
        }, 30000);
    });

    describe('verifyBankUsingPennyLess', () => {
        it('should bank account verification [penny-less] and return defined result', async () => {
            const ifsc = IFSC;
            const accountNumber = ACCOUNTNUMBER;
            const name = NAME;
            const mobile = MOBILE;
            const acceptCache = true;

            const result = await client.verifyBankUsingPennyLess(ifsc, accountNumber, name, mobile, acceptCache);

            expect(result).toBeDefined();
        }, 30000);
    });
});
