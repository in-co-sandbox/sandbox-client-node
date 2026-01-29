/**
 * Abstract class representing an authentication session.
 */
export abstract class Session {
    /** The API key. */
    protected apiKey: string;

    /**
     * Creates a new session.
     *
     * @param apiKey - The API key
     */
    constructor(apiKey: string) {
        this.apiKey = apiKey;
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
     * Sets the API key.
     *
     * @param apiKey - The API key
     * @returns The session
     */
    public withApiKey(apiKey: string): Session {
        this.apiKey = apiKey;
        return this;
    }

    /**
     * Sets the access token.
     *
     * @param accessToken - The access token
     * @returns The session
     */
    public abstract withAccessToken(accessToken: string): Session;

    /**
     * Gets the access token.
     *
     * @returns The access token
     */
    public abstract getAccessToken(): string | undefined;

    /**
     * Gets the refresh token.
     *
     * @returns The refresh token
     */
    public abstract getRefreshToken(): string | undefined;

    /**
     * Sets the refresh token.
     *
     * @param refreshToken - The refresh token
     * @returns The session
     */
    public abstract withRefreshToken(refreshToken: string): Session;
}
