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
import ajv, { Ajv, ValidateFunction } from 'ajv';
import type { GetCompanyMasterDataRequest } from '../types/request/GetCompanyMasterDataRequest';
import GetCompanyMasterDataRequestSchema from '../schemas/request/getCompanyMasterData.schema.json';
import type { GetDirectorMasterDataRequest } from '../types/request/GetDirectorMasterDataRequest';
import GetDirectorMasterDataRequestSchema from '../schemas/request/getDirectorMasterData.schema.json';

export class MCAClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;
    private ajv: Ajv;
    private validators: Map<string, ValidateFunction> = new Map();

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.ajv = new ajv({
            allErrors: true,
            validateSchema: true,
            strictKeywords: 'log',
            strictDefaults: 'log',
            schemaId: '$id',
            unknownFormats: 'ignore',
        });
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
        this.initValidators();
    }

    private initValidators(): void {
        this.validators.set('getCompanyMasterDataRequest', this.ajv.compile(GetCompanyMasterDataRequestSchema));
        this.validators.set('getDirectorMasterDataRequest', this.ajv.compile(GetDirectorMasterDataRequestSchema));
    }

    private validate<T>(schemaName: string, data: unknown): T {
        const validate = this.validators.get(schemaName);
        if (!validate) {
            throw new SandboxException(`Validator not found for schema: ${schemaName}`, 500);
        }
        if (!validate(data)) {
            const validationErrors = validate.errors || [];
            const errorMessage = `Validation failed: ${JSON.stringify(validationErrors)}`;
            const exception = new SandboxException(errorMessage, 400);
            exception.setError({ validationErrors });
            throw exception;
        }
        return data as T;
    }

    /**
     * Company Master Data
     * Fetch companies&#39;s details using CIN or LLPIN
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getCompanyMasterData(request: GetCompanyMasterDataRequest): Promise<ApiResponse> {
        try {
            this.validate<GetCompanyMasterDataRequest>('getCompanyMasterDataRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/mca/company/master-data/search',
            );

            return await this.client.postForGet(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Director Master Data
     * Fetch director&#39;s details using DIN
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getDirectorMasterData(request: GetDirectorMasterDataRequest): Promise<ApiResponse> {
        try {
            this.validate<GetDirectorMasterDataRequest>('getDirectorMasterDataRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/mca/director/master-data/search',
            );

            return await this.client.postForGet(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }
}
