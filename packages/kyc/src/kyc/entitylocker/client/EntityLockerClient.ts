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
} from '@in.co.sandbox/api-client-core';
import { Endpoint as BaseEndpoint } from '@in.co.sandbox/api-endpoints';
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
                throw new SandboxException(`Invalid request body: ${error.message}`, 400).setError({
                    validationErrors: error.issues,
                });
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Get session status
     *
     *
     * @param sessionId - Session created in Initiate Session API
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
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Fetch Document
     *
     *
     * @param sessionId - Session created in Initiate Session API
     * @param docType - Document you want to fetch
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getDocument(sessionId: string, docType: string): Promise<ApiResponse> {
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
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Get Entity Details
     *
     *
     * @param sessionId - Session created in Initiate Session API
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
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Get User Profile Details
     *
     *
     * @param sessionId - Session created in Initiate Session API
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
            throw new SandboxException('Internal Server Error', 500);
        }
    }
}
