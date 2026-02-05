import { Endpoint as BaseEndpoint } from '@in.co.sandbox/api-endpoints';
import axios, {
    AxiosError,
    AxiosHeaders,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { jwtDecode } from 'jwt-decode';

import { ApiUserCredentials } from '../auth/credential/ApiUserCredentials';
import { Endpoint } from '../auth/endpoints/Endpoint';
import { ApiUserSession } from '../auth/session/ApiUserSession';
import { ApiResponse } from '../beans/ApiResponse';
import { Entity } from '../beans/Entity';
import { SandboxException } from '../exception/SandboxException';
import { EndpointBuilder } from '../utils/EndpointBuilder';

/**
 * A client for interacting with the API.
 *
 * This class provides methods for making HTTP requests (GET, POST, DELETE) to the API endpoints.
 * It automatically manages authentication tokens via a request interceptor.
 */
export class ApiClient {
    /** The user agent string sent with every request. */
    protected static readonly USER_AGENT: string = 'in-co.sandbox.api-client-core/1.0.0 Node/14';

    /** The API version string sent with every request. */
    protected static readonly API_VERSION: string = '1.0.0';

    protected credentials: ApiUserCredentials;

    protected session: ApiUserSession | null = null;

    protected client: AxiosInstance;

    /**
     * Creates an instance of ApiClient.
     *
     * @param credentials - The API user credentials.
     * @param timeout - The connection timeout in seconds.
     * @param enableDebugging - Whether to enable detailed logging.
     *
     * @throws SandboxException if an error occurs during initialization.
     */
    constructor(
        credentials: ApiUserCredentials,
        timeout: number,
        enableDebugging: boolean,
        requestInterceptors: Array<
            (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
        >,
    ) {
        this.credentials = credentials;
        this.client = axios.create({ timeout: timeout * 1000 });

        if (requestInterceptors != null) {
            requestInterceptors.forEach((interceptor) => {
                this.client.interceptors.request.use(interceptor);
            });
        }
        // Setup interceptors

        this.client.interceptors.request.use(this.requestInterceptor.bind(this));

        if (enableDebugging) {
            this.client.interceptors.request.use(this.requestLoggingInterceptor.bind(this));
            this.client.interceptors.response.use(this.responseLoggingInterceptor.bind(this));
        }
    }

    /**
     * Sets up the request interceptor to handle authentication and token refresh.
     */

    private async requestInterceptor(axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
        const config = axiosConfig;

        // For authentication requests , don't add Authorization header
        if (
            config.url === EndpointBuilder.build(BaseEndpoint.get(this.credentials.getApiKey()), Endpoint.AUTHENTICATE)
        ) {
            return config;
        }

        // For all the other requests, ensure that the Authorization header is set

        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }

        try {
            const currentTime = Math.floor(Date.now() / 1000);

            if (!config.headers.Authorization) {
                if (this.session) {
                    const accessToken = this.session.getAccessToken()!;
                    const decodedSessionToken = jwtDecode(accessToken);

                    // Check if the token in the session is expired
                    if (decodedSessionToken.exp && decodedSessionToken.exp < currentTime) {
                        this.session = await this.authenticate();
                        config.headers.Authorization = this.session.getAccessToken();
                    } else {
                        config.headers.Authorization = accessToken;
                    }
                } else {
                    this.session = await this.authenticate();
                    config.headers.Authorization = this.session.getAccessToken();
                }
            } else {
                const token = config.headers.Authorization as string;
                const decoded = jwtDecode(token);
                // Check if issuer is sandbox
                const issuer = decoded.iss!;
                const issuerUri = new URL(issuer.startsWith('http') ? issuer : `https://${issuer}`);

                if (issuerUri.host.includes('sandbox.co.in')) {
                    // api user access token
                    if (issuerUri.host === 'api.sandbox.co.in') {
                        if (decoded.exp && decoded.exp < currentTime) {
                            if (this.session) {
                                const accessToken = this.session.getAccessToken()!;
                                const decodedSessionToken = jwtDecode(accessToken);
                                // Check if the token in the session is expired
                                if (decodedSessionToken.exp && decodedSessionToken.exp < currentTime) {
                                    this.session = await this.authenticate();
                                    config.headers.Authorization = this.session.getAccessToken();
                                } else {
                                    config.headers.Authorization = accessToken;
                                }
                            } else {
                                this.session = await this.authenticate();
                                config.headers.Authorization = this.session.getAccessToken();
                            }
                        }
                    }
                    // Check resource owner token expiry
                    if (decoded.exp && decoded.exp < currentTime) {
                        throw new SandboxException(`Token has expired: ${decoded.exp}`, 401);
                    }
                } else {
                    throw new SandboxException(`Invalid token issuer: ${decoded.iss}`, 401);
                }
            }
        } catch (error) {
            if (error instanceof SandboxException) {
                throw error;
            }
            throw new SandboxException('Internal Server Error', 500);
        }

        // Add common headers
        config.headers['User-Agent'] = ApiClient.USER_AGENT;
        config.headers['x-api-version'] = ApiClient.API_VERSION;
        config.headers['x-api-key'] = this.credentials.getApiKey();

        return config;
    }

    private async requestLoggingInterceptor(
        axiosConfig: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> {
        console.info('Request:', {
            url: axiosConfig.url,
            method: axiosConfig.method,
            headers: axiosConfig.headers,
            data: axiosConfig.data,
        });
        return axiosConfig;
    }

    private async responseLoggingInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
        console.info('Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    }

    /**
     * Authenticates using API key and secret.
     *
     * @returns The API user session
     * @throws SandboxException if authentication fails
     */
    private async authenticate(): Promise<ApiUserSession> {
        try {
            const headers = {
                'x-api-key': this.credentials.getApiKey(),
                'x-api-secret': this.credentials.getApiSecret(),
            };

            const response = await this.postForGet(
                EndpointBuilder.build(BaseEndpoint.get(this.credentials.getApiKey()), Endpoint.AUTHENTICATE),
                new Entity({}),
                headers,
            );

            if (response.getCode() === 200) {
                const responseData = response.getData();

                const session = new ApiUserSession(this.credentials.getApiKey()).withAccessToken(
                    responseData.access_token,
                );

                return session;
            }
            if (response.getCode() === 401) {
                throw new SandboxException('Invalid api key or secret', 401);
            }

            throw new SandboxException(response.getMessage(), response.getCode());
        } catch (e) {
            if (e instanceof SandboxException) {
                throw e;
            }
            throw new SandboxException('Internal Server Error', 500);
        }
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
