import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';
import { DateUtil } from '@org-quicko/core/utils';
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

/** The fields of a Sandbox API error body. */
interface SignInErrorBody {
    code?: unknown;
    message?: string;
    transaction_id?: string;
    timestamp?: number;
}

/**
 * Authenticates every request an {@link ApiClient} sends.
 *
 * - Without an `Authorization` header, it signs in with the API key and secret, caches the access token and
 *   signs in again once the token expires.
 * - With an `Authorization` header, it keeps a resource owner's token and refreshes an expired API user token.
 *
 * `ApiClient` attaches one to every client. It signs in at `Endpoint.get(apiKey)`.
 */
export class AuthRequestInterceptor {
    /** The user agent sent with every request. */
    public static readonly USER_AGENT: string = 'in-co-sandbox.api-client-core/2.0.0 Node';

    /** The API version sent with every request. */
    public static readonly API_VERSION: string = '1.0.0';

    private readonly credentials: ApiUserCredentials;

    private session: ApiUserSession | null = null;

    /** The API host to sign in at. */
    private readonly baseUrl: string;

    /** Sends only the sign-in request, so signing in never runs this interceptor again. */
    private readonly authClient: AxiosInstance;

    /**
     * @param credentials - The API key and secret to sign in with.
     * @param timeout - The sign-in request timeout, in seconds.
     */
    constructor(credentials: ApiUserCredentials, timeout: number = 30) {
        this.credentials = credentials;
        this.baseUrl = BaseEndpoint.get(credentials.getApiKey());
        this.authClient = createAxios({ timeout: timeout * 1000 });
    }

    /**
     * Adds the `Authorization`, `x-api-key`, `x-api-version` and `User-Agent` headers.
     *
     * An arrow function, so it stays bound when passed to `axios.interceptors.request.use`.
     */
    public intercept = async (axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const config = axiosConfig;
        const authenticateUrl = EndpointBuilder.build(this.baseUrl, Endpoint.AUTHENTICATE);
        if (config.url === authenticateUrl) return config;
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
        if (cached) {
            const { exp } = jwtDecode(cached);
            if (exp === undefined || exp * 1000 >= DateUtil.nowInMillis()) return cached;
        }
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
        const issuerUrl = new URL(issuer.startsWith('http') ? issuer : `https://${issuer}`);
        // sandbox.co.in or a subdomain; not hosts that merely contain the name.
        const { hostname } = issuerUrl;
        if (hostname !== 'sandbox.co.in' && !hostname.endsWith('.sandbox.co.in')) {
            throw new SandboxException(`Invalid token issuer: ${issuer}`, 401);
        }
        const issuerHost = issuerUrl.host;

        const expired = exp !== undefined && exp * 1000 < DateUtil.nowInMillis();
        if (!expired) return token;
        if (issuerHost === new URL(this.baseUrl).host) return this.accessToken();
        throw new SandboxException(`Token has expired: ${exp}`, 401);
    }

    /** Signs in with the API key and secret. */
    private async authenticate(): Promise<ApiUserSession> {
        try {
            const authenticateUrl = EndpointBuilder.build(this.baseUrl, Endpoint.AUTHENTICATE);
            const response = await this.authClient.post(authenticateUrl, '{}', {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': AuthRequestInterceptor.USER_AGENT,
                    'x-api-version': AuthRequestInterceptor.API_VERSION,
                    'x-api-key': this.credentials.getApiKey(),
                    'x-api-secret': this.credentials.getApiSecret(),
                },
            });
            // The API can also answer HTTP 200 with an error code in the body.
            const accessToken: string | undefined = response.data?.data?.access_token;
            if (response.data?.code === 200 && accessToken) {
                return new ApiUserSession(this.credentials.getApiKey()).withAccessToken(accessToken) as ApiUserSession;
            }
            throw AuthRequestInterceptor.signInError(response.data, 500);
        } catch (error) {
            if (error instanceof SandboxException) throw error;
            if (error instanceof AxiosError && error.response) {
                throw AuthRequestInterceptor.signInError(error.response.data, error.response.status);
            }
            throw new SandboxException('Internal Server Error', 500);
        }
    }

    /**
     * Builds the error for a failed sign-in from the API's response body.
     *
     * Keeps the server's code, message, transaction id and timestamp, so callers see the real reason
     * (an expired subscription, say) and can trace the request. Falls back to a default message only
     * when the server sends none.
     *
     * @param body - The response body, if any.
     * @param status - The code to use when the body has no error code: the HTTP status, or 500.
     */
    private static signInError(body: unknown, status: number): SandboxException {
        const { code, message, transaction_id: transactionId, timestamp } = (body ?? {}) as SignInErrorBody;
        const resolvedCode = typeof code === 'number' && code !== 200 ? code : status;
        const fallback = resolvedCode === 401 ? 'Invalid api key or secret' : 'Sign-in failed';
        // SandboxException's public overload wants both; its implementation accepts them missing.
        return new SandboxException(message || fallback, resolvedCode, transactionId as string, timestamp as number);
    }
}
