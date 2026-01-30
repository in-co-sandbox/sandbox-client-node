/**
 * PAN Client
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
import type { VerifyPanRequest } from '../types/request/VerifyPanRequest';
import VerifyPanRequestSchema from '../schemas/request/verifyPAN.schema.json';
import type { VerifyPanAadhaarLinkStatusRequest } from '../types/request/VerifyPanAadhaarLinkStatusRequest';
import VerifyPanAadhaarLinkStatusRequestSchema from '../schemas/request/verifyPANAadhaarLinkStatus.schema.json';

export class PANClient {
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
        this.validators.set('verifyPANRequest', this.ajv.compile(VerifyPanRequestSchema));
        this.validators.set(
            'verifyPANAadhaarLinkStatusRequest',
            this.ajv.compile(VerifyPanAadhaarLinkStatusRequestSchema),
        );
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
     * Verify PAN Details
     *
     *
     * @param request - The request body
     * @param acceptCache - Pass true to accept the cached response. If the header is not passed, or if false is sent as the value, the request will hit the origin.
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyPAN(request: VerifyPanRequest, acceptCache: string): Promise<ApiResponse> {
        try {
            this.validate<VerifyPanRequest>('verifyPANRequest', request);

            const headers: Record<string, any> = {
                'x-accept-cache': acceptCache,
            };

            const endpoint = EndpointBuilder.build(BaseEndpoint.get(this.credentials.getApiKey()), '/kyc/pan/verify');

            return await this.client.postForGet(endpoint, new Entity(request), headers);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * PAN Aadhaar Link Status
     * Linking your PAN card with Aadhaar has been made mandatory for certain services, such as filing your income tax returns. Use this API to get PAN-Aadhaar link status.
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyPANAadhaarLinkStatus(request: VerifyPanAadhaarLinkStatusRequest): Promise<ApiResponse> {
        try {
            this.validate<VerifyPanAadhaarLinkStatusRequest>('verifyPANAadhaarLinkStatusRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/pan-aadhaar/status',
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
