import { InternalAxiosRequestConfig } from 'axios';
import { ClassConstructor } from 'class-transformer/types';
import { ApiUserCredentials } from '../auth/credential/ApiUserCredentials';
import { ApiUserCredentialProvider } from '../auth/provider/ApiUserCredentialProvider';
import { SandboxException } from '../exception/SandboxException';
import { ApiClient } from './ApiClient';
import { OcrApiClient } from './OcrApiClient';

/**
 * Builder class for creating an instance of ApiClient.
 *
 * This class provides methods to configure timeouts, logging, and credentials before building the ApiClient.
 */
export class ApiClientBuilder {
    /** The API user credential provider. */
    private credentialProvider: ApiUserCredentialProvider | null = null;

    /** The timeout in seconds (default: 30). */
    public static TIMEOUT: number = 30;

    /** Flag to enable or disable logging (default: false). */
    public static ENABLE_LOGGING: boolean = false;

    public requestInterceptors: Array<
        (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
    > = [];

    /**
     * Builds and returns a new ApiClient instance with the configured settings.
     *
     * @returns A new ApiClient instance.
     * @throws SandboxException if an error occurs during client creation.
     */

    public build<T extends ApiClient | OcrApiClient>(classToBeInstantiated: ClassConstructor<T>): T {
        if (!this.credentialProvider || !this.credentialProvider.getCredentials()) {
            throw new SandboxException('Credentials are required to build the ApiClient');
        }
        return new classToBeInstantiated(
            this.credentialProvider.getCredentials(),
            ApiClientBuilder.TIMEOUT,
            ApiClientBuilder.ENABLE_LOGGING,
            this.requestInterceptors,
        );
    }
    /**
     * Configures the connection timeout.
     *
     * @param seconds - The connection timeout in seconds (maximum allowed is 30).
     * @returns The ApiClientBuilder instance.
     * @throws SandboxException if the provided timeout is greater than 30 seconds.
     */
    public withTimeout(seconds: number): ApiClientBuilder {
        ApiClientBuilder.TIMEOUT = seconds;
        return this;
    }

    /**
     * Enables or disables logging for the ApiClient.
     *
     * @param enableLogging - True to enable logging, false to disable.
     * @returns The ApiClientBuilder instance.
     */
    public withLogging(enableLogging: boolean): ApiClientBuilder {
        ApiClientBuilder.ENABLE_LOGGING = enableLogging;
        return this;
    }

    /**
     * Sets the API user credentials.
     *
     * @param credentials - The API user credentials.
     * @returns The ApiClientBuilder instance.
     */
    public withCredentials(credentials: ApiUserCredentials): ApiClientBuilder {
        if (this.credentialProvider) {
            this.credentialProvider.setCredentials(credentials);
        } else {
            this.credentialProvider = new ApiUserCredentialProvider(credentials);
        }

        return this;
    }

    public withRequestInterceptors(
        requestInterceptors: Array<
            (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
        >,
    ): ApiClientBuilder {
        requestInterceptors.forEach((interceptor) => {
            this.requestInterceptors.push(interceptor);
        });
        return this;
    }
}
