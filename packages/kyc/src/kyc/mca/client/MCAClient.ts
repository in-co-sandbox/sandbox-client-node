/**
 * MCA Client
 * Auto-generated - DO NOT EDIT
 */
import {
    ApiClient,
    ApiClientBuilder,
    ApiResponse,
    ApiUserCredentials,
    EndpointBuilder,
    SandboxException,
    Entity,
} from '@in.co.sandbox/api-client-core';
import { Endpoint as BaseEndpoint } from '@in.co.sandbox/api-endpoints';
import { ZodError } from 'zod';
import {
    GetCompanyMasterDataRequestSchema,
    type GetCompanyMasterDataRequest,
} from '../schemas/request/GetCompanyMasterDataRequest';
import {
    GetDirectorMasterDataRequestSchema,
    type GetDirectorMasterDataRequest,
} from '../schemas/request/GetDirectorMasterDataRequest';

export class MCAClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
    }

    /**
     * Company Master Data
     * Fetch companies's details using CIN or LLPIN
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getCompanyMasterData(request: GetCompanyMasterDataRequest): Promise<ApiResponse> {
        try {
            GetCompanyMasterDataRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/mca/company/master-data/search',
            );

            return await this.client.postForGet(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof ZodError) {
                const validationException = new SandboxException(`Invalid request body: ${error.message}`, 400);
                validationException.setError({ validationErrors: error.issues });
                throw validationException;
            }
            const unknownException = new SandboxException('Unexpected error occurred', 500);
            unknownException.setError({ error });
            throw unknownException;
        }
    }

    /**
     * Director Master Data
     * Fetch director's details using DIN
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getDirectorMasterData(request: GetDirectorMasterDataRequest): Promise<ApiResponse> {
        try {
            GetDirectorMasterDataRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/mca/director/master-data/search',
            );

            return await this.client.postForGet(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof ZodError) {
                const validationException = new SandboxException(`Invalid request body: ${error.message}`, 400);
                validationException.setError({ validationErrors: error.issues });
                throw validationException;
            }
            const unknownException = new SandboxException('Unexpected error occurred', 500);
            unknownException.setError({ error });
            throw unknownException;
        }
    }
}
