import { ApiUserCredentials } from '../credential/ApiUserCredentials';
import { CredentialProvider } from './CredentialProvider';

/**
 * Provider for API user credentials.
 */
export class ApiUserCredentialProvider implements CredentialProvider<ApiUserCredentials> {
    private credentials: ApiUserCredentials;

    /**
     * Creates a new API user credential provider.
     *
     * @param credentials - The API user credentials
     */
    constructor(credentials: ApiUserCredentials) {
        this.credentials = credentials;
    }

    /**
     * Gets the API user credentials.
     *
     * @returns The API user credentials
     */
    public getCredentials(): ApiUserCredentials {
        return this.credentials;
    }

    /**
     * Sets the API user credentials.
     *
     * @param credentials - The API user credentials
     */
    public setCredentials(credentials: ApiUserCredentials): void {
        this.credentials = credentials;
    }
}
