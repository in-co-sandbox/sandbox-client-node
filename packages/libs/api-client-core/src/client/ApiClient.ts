import {
    AxiosError,
    create as createAxios,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import { ApiUserCredentials } from '../auth/credential/ApiUserCredentials';
import { ApiResponse } from '../beans/ApiResponse';
import { Entity } from '../beans/Entity';
import { SandboxException } from '../exception/SandboxException';
import { EndpointBuilder } from '../utils/EndpointBuilder';
import { AuthRequestInterceptor } from './interceptor/AuthRequestInterceptor';
import type { RequestInterceptor } from './interceptor/RequestInterceptor';

/** Options for {@link ApiClient}, usually set through `ApiClientBuilder`. */
export interface ApiClientOptions {
    /**
     * How requests are authenticated.
     * - Omitted: an {@link AuthRequestInterceptor} with the client's credentials.
     * - An interceptor: used instead of the default one.
     * - `false`: no authentication.
     */
    auth?: RequestInterceptor | false;
}

/**
 * A client for interacting with the API.
 *
 * This class provides methods for making HTTP requests (GET, POST, DELETE) to the API endpoints.
 * It authenticates requests with an {@link AuthRequestInterceptor} unless {@link ApiClientOptions.auth} says otherwise.
 */
export class ApiClient {
    /** The user agent sent with every request. */
    protected static readonly USER_AGENT: string = AuthRequestInterceptor.USER_AGENT;

    /** The API version sent with every request. */
    protected static readonly API_VERSION: string = AuthRequestInterceptor.API_VERSION;

    protected credentials: ApiUserCredentials;

    protected client: AxiosInstance;

    /**
     * Creates an instance of ApiClient.
     *
     * @param credentials - The API user credentials.
     * @param timeout - The connection timeout in seconds.
     * @param enableDebugging - Whether to log every request and response.
     * @param requestInterceptors - Interceptors that run after authentication, on every request.
     * @param options - How requests are authenticated; see {@link ApiClientOptions}.
     */
    constructor(
        credentials: ApiUserCredentials,
        timeout: number,
        enableDebugging: boolean,
        requestInterceptors: RequestInterceptor[] = [],
        options: ApiClientOptions = {},
    ) {
        this.credentials = credentials;
        this.client = createAxios({ timeout: timeout * 1000 });

        // Axios runs request interceptors last-registered first: logging, then auth, then the caller's.
        requestInterceptors?.forEach((interceptor) => this.client.interceptors.request.use(interceptor));

        const auth = options.auth ?? new AuthRequestInterceptor(credentials, timeout).intercept;
        if (auth) this.client.interceptors.request.use(auth);

        if (enableDebugging) {
            this.client.interceptors.request.use(this.requestLoggingInterceptor.bind(this));
            this.client.interceptors.response.use(this.responseLoggingInterceptor.bind(this));
        }
    }

    private async requestLoggingInterceptor(
        axiosConfig: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> {
        // oxlint-disable-next-line no-console -- logging is what withLogging(true) asks for
        console.info('Request:', {
            url: axiosConfig.url,
            method: axiosConfig.method,
            headers: axiosConfig.headers,
            data: axiosConfig.data,
        });
        return axiosConfig;
    }

    private async responseLoggingInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
        // oxlint-disable-next-line no-console -- logging is what withLogging(true) asks for
        console.info('Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    }

    // ============================================================================
    // POST FOR GET
    // ============================================================================

    /**
     * Sends a POST request with a JSON body and returns an ApiResponse.
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
    ): Promise<ApiResponse> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});

            // Headers are set in the interceptor so only additional headers need to be merged.
            const config: AxiosRequestConfig = {
                headers: additionalHeaders ? { ...additionalHeaders } : {},
            };

            const requestBody = body ? JSON.stringify(body.getData()) : '';

            // Set content-type header for JSON.
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json; charset=utf-8',
            };

            const axiosResponse = await this.client.post(finalUrl, requestBody, config);

            // Check for JSON response.
            const apiResponse = new ApiResponse(axiosResponse.data);
            return apiResponse;
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    // ============================================================================
    // POST (no response)
    // ============================================================================

    /**
     * Sends a POST request with a JSON body.
     *
     * @param url - The URL template.
     * @param body - The entity to be sent as JSON.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async post(
        url: string,
        body: Entity,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<void> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const requestBody = body && body.getData() ? JSON.stringify(body.getData()) : '';
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    ...(additionalHeaders || {}),
                },
            };
            await this.client.post(finalUrl, requestBody, config);
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(error.response?.data.message || error.message, error.status || 500);
            }
            throw new SandboxException(error instanceof Error ? error.message : String(error));
        }
    }

    // ============================================================================
    // PATCH METHODS
    // ============================================================================

    /**
     * Sends a PATCH request with a JSON body.
     *
     * @param url - The URL template.
     * @param body - The entity to be sent as JSON.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async patch(
        url: string,
        body: Entity,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<void> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const requestBody = body && body.getData() ? JSON.stringify(body.getData()) : '';
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    ...(additionalHeaders || {}),
                },
            };
            await this.client.patch(finalUrl, requestBody, config);
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    // ============================================================================
    // PUT METHODS
    // ============================================================================

    /**
     * Sends a PUT request with a JSON body.
     *
     * @param url - The URL template.
     * @param body - The entity to be sent as JSON.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async put(
        url: string,
        body: Entity,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<void> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const requestBody = body && body.getData() ? JSON.stringify(body.getData()) : '';
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    ...(additionalHeaders || {}),
                },
            };
            await this.client.put(finalUrl, requestBody, config);
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    // ============================================================================
    // GET METHODS
    // ============================================================================

    /**
     * Sends a GET request and returns an ApiResponse.
     *
     * @param url - The URL template.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @returns A promise that resolves to an ApiResponse.
     *
     * @throws SandboxException if an error occurs.
     */
    public async get(
        url: string,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const config: AxiosRequestConfig = {
                headers: additionalHeaders ? { ...additionalHeaders } : {},
            };
            const response = await this.client.get(finalUrl, config);
            const apiResponse = new ApiResponse(response.data);

            return apiResponse;
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    /**
     * Sends a GET request to retrieve all records and returns an ApiResponse.
     *
     * @param url - The URL template.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @returns A promise that resolves to an ApiResponse.
     *
     * @throws SandboxException if an error occurs.
     */
    public async getAll(
        url: string,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<ApiResponse> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const config: AxiosRequestConfig = {
                headers: additionalHeaders ? { ...additionalHeaders } : {},
            };
            const response = await this.client.get(finalUrl, config);
            const apiResponse = new ApiResponse(response.data);
            return apiResponse;
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    // ============================================================================
    // DELETE METHOD
    // ============================================================================

    /**
     * Sends a DELETE request.
     *
     * @param url - The URL template.
     * @param additionalHeaders - Additional headers to include.
     * @param pathParams - An object mapping path parameter keys to values.
     * @param queryParams - An object mapping query parameter keys to values.
     *
     * @throws SandboxException if the API responds with an error.
     */
    public async delete(
        url: string,
        additionalHeaders?: Record<string, string>,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): Promise<void> {
        try {
            const finalUrl = EndpointBuilder.build(url, pathParams || {}, queryParams || {});
            const config: AxiosRequestConfig = {
                headers: additionalHeaders ? { ...additionalHeaders } : {},
            };
            await this.client.delete(finalUrl, config);
        } catch (error: unknown) {
            if (error instanceof SandboxException) {
                throw error;
            }
            if (error instanceof AxiosError) {
                throw new SandboxException(
                    error.response?.data.message,
                    error.response?.data.code,
                    error.response?.data.transaction_id,
                    error.response?.data.timestamp,
                );
            }
            throw new SandboxException('Failed to process request', 500);
        }
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

    /**
     * Converts a readable stream into a Buffer.
     *
     * @param stream - The input stream.
     * @returns A promise that resolves to a Buffer containing the stream's data.
     */
    private static streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
