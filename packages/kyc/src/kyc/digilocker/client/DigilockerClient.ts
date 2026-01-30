/**
 * Digilocker Client
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
import type { VerifyUserAccountRequest } from '../types/request/VerifyUserAccountRequest';
import VerifyUserAccountRequestSchema from '../schemas/request/verifyUserAccount.schema.json';
import type { InitiateSessionRequest } from '../types/request/InitiateSessionRequest';
import InitiateSessionRequestSchema from '../schemas/request/initiateSession.schema.json';

export class DigilockerClient {
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
        this.validators.set('verifyUserAccountRequest', this.ajv.compile(VerifyUserAccountRequestSchema));
        this.validators.set('initiateSessionRequest', this.ajv.compile(InitiateSessionRequestSchema));
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
     * Verify User Account
     *
     *
     * @param request - The request body
     * @returns Promise<void>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyUserAccount(request: VerifyUserAccountRequest): Promise<void> {
        try {
            this.validate<VerifyUserAccountRequest>('verifyUserAccountRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker/user/verify',
            );

            await this.client.post(endpoint, new Entity(request));
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
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
            this.validate<InitiateSessionRequest>('initiateSessionRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker/sessions/init',
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
     * Get session status
     *
     *
     * @param sessionId - Session id
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
                '/kyc/digilocker/sessions/{session_id}/status',
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
     * Fetch document
     *
     *
     * @param sessionId - Session id
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
                '/kyc/digilocker/sessions/{session_id}/documents/{doc_type}',
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
     * Get User Profile
     *
     *
     * @param sessionId - Session id
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async getUserProfile(sessionId: string): Promise<ApiResponse> {
        try {
            const pathParams: Record<string, string> = {
                session_id: String(sessionId),
            };

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker/sessions/{session_id}/user/profile',
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
