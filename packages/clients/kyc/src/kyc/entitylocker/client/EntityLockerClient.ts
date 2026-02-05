/**
 * EntityLocker Client
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
} from '@in-co-sandbox/api-client-core';
import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';
import { ZodError } from 'zod';
import { InitiateSessionRequestSchema, type InitiateSessionRequest } from '../schemas/request/InitiateSessionRequest';

export class EntityLockerClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
    }

    /**
     * Initiate session
     *
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async initiateSession(request: InitiateSessionRequest): Promise<ApiResponse> {
        try {
            InitiateSessionRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/entitylocker/sessions/init',
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
     * Get session status
     *
     *
     * @param sessionId - Session identifier generated during EntityLocker [Initiate Session API](https://developer.sandbox.co.in/api-reference/kyc/entitylocker/endpoints/initiate_session) .
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
                '/kyc/entitylocker/sessions/{session_id}/status',
            );

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
     * Fetch Document
     *
     *
     * @param sessionId - Session identifier generated during EntityLocker [Initiate Session API](https://developer.sandbox.co.in/api-reference/kyc/entitylocker/endpoints/initiate_session) .
     * @param docType - Document type identifying which EntityLocker document to retrieve. Must match one of the consented doc_types values.
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getDocument(
        sessionId: string,
        docType: 'company_master_details' | 'gstn_details' | 'udhyam_certificate',
    ): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
                doc_type: String(docType),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/entitylocker/sessions/{session_id}/documents/{doc_type}',
            );

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
     * Get Entity Details
     *
     *
     * @param sessionId - Session identifier generated during EntityLocker [Initiate Session API](https://developer.sandbox.co.in/api-reference/kyc/entitylocker/endpoints/initiate_session) .
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getEntityDetails(sessionId: string): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/entitylocker/sessions/{session_id}/entity',
            );

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
     * Get User Profile Details
     *
     *
     * @param sessionId - Session identifier generated during EntityLocker [Initiate Session API](https://developer.sandbox.co.in/api-reference/kyc/entitylocker/endpoints/initiate_session) .
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getUserDetails(sessionId: string): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/entitylocker/sessions/{session_id}/user/profile',
            );

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
}
