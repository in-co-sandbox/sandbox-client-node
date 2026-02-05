import { Session } from './Session';

/**
 * Session for API user authentication.
 */
export class ApiUserSession extends Session {
    /** The access token. */
    private accessToken?: string;

    /** The refresh token. */
    private refreshToken?: string;

    /**
     * Gets the access token.
     *
     * @returns The access token
     */
    public getAccessToken(): string | undefined {
        return this.accessToken;
    }

    /**
     * Gets the refresh token.
     *
     * @returns The refresh token
     */
    public getRefreshToken(): string | undefined {
        return this.refreshToken;
    }

    /**
     * Sets the access token.
     *
     * @param accessToken - The access token
     * @returns The session
     */
    public withAccessToken(accessToken: string): Session {
        // TODO: check claim matches with apiKey
        this.accessToken = accessToken;
        return this;
    }

    /**
     * Sets the refresh token.
     *
     * @param refreshToken - The refresh token
     * @returns The API user session
     */
    public withRefreshToken(refreshToken: string): ApiUserSession {
        // TODO: check claim matches with apiKey
        this.refreshToken = refreshToken;
        return this;
    }
}
