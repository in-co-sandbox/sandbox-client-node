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
import { ZodError } from 'zod';
import { VerifyPanRequestSchema, type VerifyPanRequest } from '../schemas/request/VerifyPanRequest';
import {
    VerifyPanAadhaarLinkStatusRequestSchema,
    type VerifyPanAadhaarLinkStatusRequest,
} from '../schemas/request/VerifyPanAadhaarLinkStatusRequest';

export class PANClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
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
            VerifyPanRequestSchema.parse(request);

            const headers: Record<string, any> = {
                'x-accept-cache': acceptCache,
            };

            const endpoint = EndpointBuilder.build(BaseEndpoint.get(this.credentials.getApiKey()), '/kyc/pan/verify');

            return await this.client.postForGet(endpoint, new Entity(request), headers);
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
     * PAN Aadhaar Link Status
     * Linking your PAN card with Aadhaar has been made mandatory for certain services, such as filing your income tax returns. Use this API to get PAN-Aadhaar link status.
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyPANAadhaarLinkStatus(request: VerifyPanAadhaarLinkStatusRequest): Promise<ApiResponse> {
        try {
            VerifyPanAadhaarLinkStatusRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/pan-aadhaar/status',
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
