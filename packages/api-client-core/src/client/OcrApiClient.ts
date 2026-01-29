import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { ApiResponse } from '../beans/ApiResponse';
import { Entity } from '../beans/Entity';
import { SandboxException } from '../exception/SandboxException';
import { EndpointBuilder } from '../utils/EndpointBuilder';
import { ApiClient } from './ApiClient';

export class OcrApiClient extends ApiClient {
    /**
     * Sends a POST request with a file stream (multipart form data) and returns an ApiResponse.
     *
     * @param url - The URL template.
     * @param stream - A readable stream containing file data.
     * @param additionalHeaders - Additional headers to include in the request.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @returns A promise that resolves to an ApiResponse.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async postForGet(
        url: string,
        stream: NodeJS.ReadableStream,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse>;

    /**
     * Sends a POST request with a FormData instance and returns an ApiResponse.
     *
     * @param url - The URL template.
     * @param formData - A FormData instance containing file data.
     * @param additionalHeaders - Additional headers to include in the request.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @returns A promise that resolves to an ApiResponse.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async postForGet(
        url: string,
        formData: FormData,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse>;

    /**
     * Sends a POST request with a JSON body and returns an ApiResponse (inherited from parent).
     *
     * @param url - The URL template.
     * @param body - The entity to be sent as JSON.
     * @param additionalHeaders - Additional headers to include in the request.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @returns A promise that resolves to an ApiResponse.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async postForGet(
        url: string,
        body: Entity,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse>;

    public async postForGet(
        url: string,
        bodyOrStreamOrFormData: Entity | NodeJS.ReadableStream | FormData,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            let axiosResponse: AxiosResponse;
            // Headers are set in the interceptor so only additional headers need to be merged.
            const config: AxiosRequestConfig = {
                headers: additionalHeaders ? { ...additionalHeaders } : {},
            };

            // If bodyOrStreamOrFormData is a form-data, use it as is.
            if (this.isFormData(bodyOrStreamOrFormData)) {
                // Set content-type header for form-data.
                config.headers = {
                    ...config.headers,
                    ...bodyOrStreamOrFormData.getHeaders(),
                };
                axiosResponse = await this.client.post(finalUrl, bodyOrStreamOrFormData, config);
            }
            // If bodyOrStreamOrFormData is a stream, build multipart form data.
            else if (this.isReadableStream(bodyOrStreamOrFormData)) {
                const formData = new FormData();
                const fileBuffer = await this.streamToBuffer(bodyOrStreamOrFormData);
                formData.append('file', fileBuffer, { contentType: 'application/pdf' });
                // When using FormData in Node, merge in its headers.
                config.headers = { ...config.headers, ...formData.getHeaders() };
                axiosResponse = await this.client.post(finalUrl, formData, config);
            } else {
                // For Entity objects, delegate to parent class implementation
                return super.postForGet(
                    url,
                    bodyOrStreamOrFormData as Entity,
                    additionalHeaders,
                    pathParams,
                    queryParams,
                );
            }

            const apiResponse = new ApiResponse(axiosResponse.data);

            if (apiResponse.hasError()) {
                throw new SandboxException(apiResponse.getMessage(), apiResponse.getCode());
            }

            return apiResponse;
        } catch (error: any) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(error.response?.data.message || error.message, error.status || 500);
            }
            throw new SandboxException(error.message);
        }
    }

    /**
     * Type guard to check if an object is a readable stream.
     *
     * @param obj - The object to check.
     * @returns True if the object is a NodeJS.ReadableStream.
     */
    private isReadableStream(obj: any): obj is NodeJS.ReadableStream {
        return obj && typeof obj.on === 'function' && typeof obj.read === 'function';
    }

    /**
     * Type guard to check if an object is a FormData instance.
     *
     * @param obj - The object to check.
     * @returns True if the object is a FormData instance.
     */
    private isFormData(obj: any): obj is FormData {
        return obj instanceof FormData;
    }

    /**
     * Converts a readable stream into a Buffer.
     *
     * @param stream - The input stream.
     * @returns A promise that resolves to a Buffer containing the stream's data.
     */
    private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
