import type { ApiUserCredentials } from '../auth/credential/ApiUserCredentials';
import { ApiUserCredentialProvider } from '../auth/provider/ApiUserCredentialProvider';
import { SandboxException } from '../exception/SandboxException';
import type { ApiClient } from './ApiClient';
import type { RequestInterceptor } from './interceptor/RequestInterceptor';
import type { OcrApiClient } from './OcrApiClient';

/** A client class that {@link ApiClientBuilder.build} can create: {@link ApiClient} or a subclass. */
export type ApiClientConstructor<T extends ApiClient | OcrApiClient> = new (
    credentials: ApiUserCredentials,
    timeout: number,
    enableDebugging: boolean,
    requestInterceptors: RequestInterceptor[],
) => T;

/**
 * Builds an {@link ApiClient}.
 *
 * Each builder keeps its own settings; the static `TIMEOUT` and `ENABLE_LOGGING` are only the defaults.
 */
export class ApiClientBuilder {
    /** Default timeout, in seconds. */
    public static TIMEOUT: number = 30;

    /** Whether new builders log requests and responses by default. */
    public static ENABLE_LOGGING: boolean = false;

    private credentialProvider: ApiUserCredentialProvider | null = null;

    private timeout: number = ApiClientBuilder.TIMEOUT;

    private enableLogging: boolean = ApiClientBuilder.ENABLE_LOGGING;

    /** Interceptors that run after authentication, on every request. */
    public requestInterceptors: RequestInterceptor[] = [];

    /**
     * Creates a client of the given class with this builder's settings.
     *
     * @param ClientClass - {@link ApiClient} or a subclass.
     * @throws SandboxException when no credentials were set.
     */
    public build<T extends ApiClient | OcrApiClient>(ClientClass: ApiClientConstructor<T>): T {
        const credentials = this.credentialProvider?.getCredentials();
        if (!credentials) throw new SandboxException('Credentials are required to build the ApiClient');
        return new ClientClass(credentials, this.timeout, this.enableLogging, this.requestInterceptors);
    }

    /**
     * Sets the request timeout.
     *
     * @param seconds - The timeout in seconds.
     */
    public withTimeout(seconds: number): ApiClientBuilder {
        this.timeout = seconds;
        return this;
    }

    /**
     * Logs every request and response to the console.
     *
     * @param enableLogging - True to log, false not to.
     */
    public withLogging(enableLogging: boolean): ApiClientBuilder {
        this.enableLogging = enableLogging;
        return this;
    }

    /**
     * Sets the API key and secret.
     *
     * @param credentials - The API user credentials.
     */
    public withCredentials(credentials: ApiUserCredentials): ApiClientBuilder {
        if (this.credentialProvider) this.credentialProvider.setCredentials(credentials);
        else this.credentialProvider = new ApiUserCredentialProvider(credentials);
        return this;
    }

    /**
     * Adds interceptors that run after authentication, on every request.
     *
     * @param requestInterceptors - The interceptors, in the order they should run.
     */
    public withRequestInterceptors(requestInterceptors: RequestInterceptor[]): ApiClientBuilder {
        this.requestInterceptors.push(...requestInterceptors);
        return this;
    }
}
