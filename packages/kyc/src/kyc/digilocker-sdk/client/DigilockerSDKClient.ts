/**
 * DigilockerSDK Client
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
import { CreateSessionRequestSchema, type CreateSessionRequest } from '../schemas/request/CreateSessionRequest';

export class DigilockerSDKClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
    }

    /**
     * Create Session
     *
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async createSession(request: CreateSessionRequest): Promise<ApiResponse> {
        try {
            CreateSessionRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker-sdk/sessions/create',
            );

            return await this.client.postForGet(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new SandboxException(`Invalid request body: ${error.message}`, 400).setError({
                    validationErrors: error.issues,
                });
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Session Status
     *
     *
     * @param sessionId - Session identifier generated during DigiLocker SDK [Create Session API](https://developer.sandbox.co.in/api-reference/kyc/digilocker-sdk/endpoints/create-session) .
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getSessionStatus(sessionId: string): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker-sdk/sessions/{session_id}/status',
            );

            return await this.client.get(endpoint, undefined, pathParams);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Get Document
     *
     *
     * @param sessionId - Session identifier generated during DigiLocker SDK [Create Session API](https://developer.sandbox.co.in/api-reference/kyc/digilocker-sdk/endpoints/create-session) .
     * @param docType - Document type identifying which DigiLocker document to retrieve. Must match one of the consented doc_types values.
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getDocument(sessionId: string, docType: 'aadhaar' | 'pan' | 'driving_license'): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
                doc_type: String(docType),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker-sdk/sessions/{session_id}/documents/{doc_type}',
            );

            return await this.client.get(endpoint, undefined, pathParams);
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }
}
