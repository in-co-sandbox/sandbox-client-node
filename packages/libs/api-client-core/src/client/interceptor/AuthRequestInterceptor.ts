import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';
import {
    AxiosError,
    AxiosHeaders,
    type AxiosInstance,
    create as createAxios,
    type InternalAxiosRequestConfig,
} from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ApiUserCredentials } from '../../auth/credential/ApiUserCredentials';
import { Endpoint } from '../../auth/endpoints/Endpoint';
import { ApiUserSession } from '../../auth/session/ApiUserSession';
import { SandboxException } from '../../exception/SandboxException';
import { EndpointBuilder } from '../../utils/EndpointBuilder';

/**
 * Authenticates every request an {@link ApiClient} sends.
 *
 * - Without an `Authorization` header, it signs in with the API key and secret, caches the access token and
 *   signs in again once the token expires.
 * - With an `Authorization` header, it keeps a resource owner's token and refreshes an expired API user token.
 *
 * `ApiClient` attaches one by default. Pass your own to `ApiClientBuilder.withAuth` to replace it.
 */
export class AuthRequestInterceptor {
    /** The user agent sent with every request. */
    public static readonly USER_AGENT: string = 'in-co-sandbox.api-client-core/2.0.0 Node';

    /** The API version sent with every request. */
    public static readonly API_VERSION: string = '1.0.0';

    private readonly credentials: ApiUserCredentials;

    private session: ApiUserSession | null = null;

    /** Sends only the sign-in request, so signing in never runs this interceptor again. */
    private readonly authClient: AxiosInstance;

    /**
     * @param credentials - The API key and secret to sign in with.
     * @param timeout - The sign-in request timeout, in seconds.
     */
    constructor(credentials: ApiUserCredentials, timeout: number = 30) {
        this.credentials = credentials;
        this.authClient = createAxios({ timeout: timeout * 1000 });
    }

    /**
     * Adds the `Authorization`, `x-api-key`, `x-api-version` and `User-Agent` headers.
     *
     * An arrow function, so it stays bound when passed to `axios.interceptors.request.use`.
     */
    public intercept = async (axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const config = axiosConfig;
        if (config.url === this.authenticateUrl()) return config;
        if (!config.headers) config.headers = new AxiosHeaders();

        try {
            const authorization = config.headers.Authorization as string | undefined;
            config.headers.Authorization = authorization
                ? await this.checkAuthorization(authorization)
                : await this.accessToken();
        } catch (error) {
            if (error instanceof SandboxException) throw error;
            throw new SandboxException('Internal Server Error', 500);
        }

        config.headers['User-Agent'] = AuthRequestInterceptor.USER_AGENT;
        config.headers['x-api-version'] = AuthRequestInterceptor.API_VERSION;
        config.headers['x-api-key'] = this.credentials.getApiKey();
        return config;
    };

    /** Returns the cached API user token, signing in when there is none or it has expired. */
    private async accessToken(): Promise<string> {
        const cached = this.session?.getAccessToken();
        if (cached && !AuthRequestInterceptor.isExpired(cached)) return cached;
        this.session = await this.authenticate();
        return this.session.getAccessToken()!;
    }

    /**
     * Checks a token the caller set.
     *
     * - An API user token issued by this API's host is refreshed when expired.
     * - A resource owner token is kept, and rejected once expired.
     * - A token from any other issuer is rejected.
     */
    private async checkAuthorization(token: string): Promise<string> {
        const { iss: issuer, exp } = jwtDecode(token);
        if (!issuer) throw new SandboxException('Invalid token issuer: undefined', 401);
        const issuerHost = new URL(issuer.startsWith('http') ? issuer : `https://${issuer}`).host;
        if (!issuerHost.includes('sandbox.co.in')) throw new SandboxException(`Invalid token issuer: ${issuer}`, 401);

        const expired = exp !== undefined && exp < AuthRequestInterceptor.now();
        if (!expired) return token;
        if (issuerHost === new URL(this.baseUrl()).host) return this.accessToken();
        throw new SandboxException(`Token has expired: ${exp}`, 401);
    }

    /** Signs in with the API key and secret. */
    private async authenticate(): Promise<ApiUserSession> {
        try {
            const response = await this.authClient.post(this.authenticateUrl(), '{}', {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': AuthRequestInterceptor.USER_AGENT,
                    'x-api-version': AuthRequestInterceptor.API_VERSION,
                    'x-api-key': this.credentials.getApiKey(),
                    'x-api-secret': this.credentials.getApiSecret(),
                },
            });
            const accessToken: string | undefined = response.data?.data?.access_token;
            if (!accessToken) throw new SandboxException('Sign-in response has no access token', 500);
            return new ApiUserSession(this.credentials.getApiKey()).withAccessToken(accessToken) as ApiUserSession;
        } catch (error) {
            if (error instanceof SandboxException) throw error;
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw new SandboxException('Invalid api key or secret', 401);
            }
            if (error instanceof AxiosError && error.response) {
                const { message, code, transaction_id: transactionId, timestamp } = error.response.data ?? {};
                throw new SandboxException(message, code ?? error.response.status, transactionId, timestamp);
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    private baseUrl(): string {
        return BaseEndpoint.get(this.credentials.getApiKey());
    }

    private authenticateUrl(): string {
        return EndpointBuilder.build(this.baseUrl(), Endpoint.AUTHENTICATE);
    }

    private static isExpired(token: string): boolean {
        const { exp } = jwtDecode(token);
        return exp !== undefined && exp < AuthRequestInterceptor.now();
    }

    private static now(): number {
        return Math.floor(Date.now() / 1000);
    }
}
