import { Credentials } from './Credentials';

/**
 * Credentials for API user authentication.
 */
export class ApiUserCredentials implements Credentials {
    private apiKey: string;

    private apiSecret: string;

    /**
     * Creates new API user credentials.
     *
     * @param apiKey - The API key
     * @param apiSecret - The API secret
     */
    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    /**
     * Gets the API key.
     *
     * @returns The API key
     */
    public getApiKey(): string {
        return this.apiKey;
    }

    /**
     * Gets the API secret.
     *
     * @returns The API secret
     */
    public getApiSecret(): string {
        return this.apiSecret;
    }

    /**
     * Gets the username.
     *
     * @returns The username
     */
    public getUsername(): string {
        return this.apiKey;
    }

    /**
     * Gets the password.
     *
     * @returns The password
     */
    public getPassword(): string {
        return this.apiSecret;
    }
}
