/**
 * Aadhaar Client
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
import { GenerateOtpRequestSchema, type GenerateOtpRequest } from '../schemas/request/GenerateOtpRequest';
import { VerifyOtpRequestSchema, type VerifyOtpRequest } from '../schemas/request/VerifyOtpRequest';

export class AadhaarClient {
    private client: ApiClient;
    private credentials: ApiUserCredentials;

    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
        this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
    }

    /**
     * Aadhaar Offline e-KYC Generate OTP
     *
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async generateOTP(request: GenerateOtpRequest): Promise<ApiResponse> {
        try {
            GenerateOtpRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/aadhaar/okyc/otp',
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
     * Aadhaar Offline e-KYC Verify OTP
     *
     *
     * @param request - The request body
     * @returns Promise<ApiResponse>
     * @throws SandboxException if the API call fails or validation fails
     */
    public async verifyOTP(request: VerifyOtpRequest): Promise<ApiResponse> {
        try {
            VerifyOtpRequestSchema.parse(request);

            const endpoint = EndpointBuilder.build(
                BaseEndpoint.get(this.credentials.getApiKey()),
                '/kyc/aadhaar/okyc/otp/verify',
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
