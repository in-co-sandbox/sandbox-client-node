import { Session } from './Session';

/**
 * Session for resource owner authentication.
 */
export class ResourceOwnerSession extends Session {
    /** The access token. */
    private accessToken?: string;

    /**
     * Sets the access token.
     *
     * @param accessToken - The access token
     * @returns The resource owner session
     */
    public withAccessToken(accessToken: string): ResourceOwnerSession {
        // TODO: check claim matches with apiKey
        this.accessToken = accessToken;
        return this;
    }

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
        return undefined;
    }

    /**
     * Sets the refresh token.
     *
     * @param _refreshToken - The refresh token
     * @returns The session
     */

    public withRefreshToken(refreshToken: string): Session {
        // Resource owner session doesn't use refresh tokens
        return this;
    }
}
