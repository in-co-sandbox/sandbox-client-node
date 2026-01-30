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
import ajv, { Ajv, ValidateFunction } from 'ajv';
import type { CreateSessionRequest } from '../types/request/CreateSessionRequest';
import CreateSessionRequestSchema from '../schemas/request/createSession.schema.json';

export class DigilockerSDKClient {
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
        this.validators.set('createSessionRequest', this.ajv.compile(CreateSessionRequestSchema));
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
     * Create Session
     *
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async createSession(request: CreateSessionRequest): Promise<ApiResponse> {
        try {
            this.validate<CreateSessionRequest>('createSessionRequest', request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/digilocker-sdk/sessions/create',
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
     * Session Status
     *
     *
     * @param sessionId - SDK session created in Create Session API
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
     * @param sessionId - SDK session created in Create Session API
     * @param docType - Document you want to fetch
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
