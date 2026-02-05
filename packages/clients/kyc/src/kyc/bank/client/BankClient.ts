/**
 * Bank Client
 * Auto-generated - DO NOT EDIT
 */
import {
    ApiClient,
    ApiClientBuilder,
    ApiResponse,
    ApiUserCredentials,
    EndpointBuilder,
    SandboxException,
} from '@in-co-sandbox/api-client-core';
import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';

export class BankClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
    }

    /**
     * IFSC Verification
     * You can identify a bank branch details from given IFSC code
     *
     * @param ifsc - 11-digit alpha-numeric code used to identify the bank branches
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyIFSC(ifsc: string): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                ifsc: String(ifsc),
            };

            const endpoint = EndpointBuilder.build(BaseEndpoint.get(this.credentials.getApiKey()), '/bank/{ifsc}');

            return await this.client.get(endpoint, undefined, pathParams);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            const unknownException = new SandboxException('Unexpected error occurred', 500);
            unknownException.setError({ error });
            throw unknownException;
        }
    }

    /**
	 * Bank Account Verification [Penny-Drop]
	 * Bank account verification or penny drop check as is commonly referred to is a way to verify the authenticity of a customer's bank account. This operation can be used to verify a bank account and ifsc code combination. The operation will return a success response (billable) in two cases:

1. The bank account or ifsc code or both are invalid
2. The bank account and ifsc combination are verified
	 *
	 * @param ifsc - 11-digit alpha-numeric code used to identify the bank branches
	 * @param accountNumber - Bank account number. Max length: 40 characters
	 * @param name - `optional` Name. Max length: 100 characters
	 * @param mobile - `optional` Mobile. Length: 10 digits
	 * @param acceptCache - Controls cache behavior for the request:
true — Return cached response if available
false — Bypass cache and fetch fresh data from origin
Default: If omitted, returns fresh data from origin
	 * @returns Promise<ApiResponse>
	 * @throws SandboxException if the API call fails or validation fails
	 */
    public async verifyBankUsingPennyDrop(
        ifsc: string,
        accountNumber: string,
        name?: string,
        mobile?: string,
        acceptCache?: boolean,
    ): Promise<ApiResponse> {
        try {
            const headers: Record<string, any> = {
                'x-accept-cache': acceptCache,
            };

            const pathParams: Record<string, string> = {
                ifsc: String(ifsc),
                account_number: String(accountNumber),
            };

            const queryParams: Record<string, any> = {
                name: name,
                mobile: mobile,
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/bank/{ifsc}/accounts/{account_number}/verify',
            );

            return await this.client.get(endpoint, headers, pathParams, queryParams);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            const unknownException = new SandboxException('Unexpected error occurred', 500);
            unknownException.setError({ error });
            throw unknownException;
        }
    }

    /**
	 * Bank Account Verification [Penny-Less]
	 * 
	 *
	 * @param ifsc - 11-digit alpha-numeric code used to identify the bank branches
	 * @param accountNumber - Bank account number. Max length: 40 characters
	 * @param name - Name. Max length: 100 characters
	 * @param mobile - Mobile. Length: 10 digits
	 * @param acceptCache - Controls cache behavior for the request:
true — Return cached response if available
false — Bypass cache and fetch fresh data from origin
Default: If omitted, returns fresh data from origin
	 * @returns Promise<ApiResponse>
	 * @throws SandboxException if the API call fails or validation fails
	 */
    public async verifyBankUsingPennyLess(
        ifsc: string,
        accountNumber: string,
        name?: string,
        mobile?: string,
        acceptCache?: boolean,
    ): Promise<ApiResponse> {
        try {
            const headers: Record<string, any> = {
                'x-accept-cache': acceptCache,
            };

            const pathParams: Record<string, string> = {
                ifsc: String(ifsc),
                account_number: String(accountNumber),
            };

            const queryParams: Record<string, any> = {
                name: name,
                mobile: mobile,
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/bank/{ifsc}/accounts/{account_number}/penniless-verify',
            );

            return await this.client.get(endpoint, headers, pathParams, queryParams);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            const unknownException = new SandboxException('Unexpected error occurred', 500);
            unknownException.setError({ error });
            throw unknownException;
        }
    }
}
