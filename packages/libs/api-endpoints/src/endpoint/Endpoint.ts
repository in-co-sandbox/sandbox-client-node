import { HOST } from './host';

/**
 * Base URLs of the Sandbox API.
 *
 * {@link Endpoint.get} picks the host for an API key:
 * - The npm build: `key_test_…` uses {@link Endpoint.test}, any other key {@link Endpoint.live}.
 * - The internal dev and uat builds: the host they were built for, for every key.
 */
export class Endpoint {
    /** Production API host. */
    public static readonly LIVE: string = 'https://api.sandbox.co.in';

    /** Test API host, for `key_test_…` keys. */
    public static readonly TEST: string = 'https://test-api.sandbox.co.in';

    /** @returns The production API host. */
    public static live(): string {
        return Endpoint.LIVE;
    }

    /** @returns The test API host. */
    public static test(): string {
        return Endpoint.TEST;
    }

    /**
     * Gets the API host for an API key.
     *
     * @param apiKey - The API key, such as `key_live_…` or `key_test_…`.
     * @returns The host this build is pinned to, otherwise the host for the key's environment.
     */
    public static get(apiKey: string): string {
        if (HOST) return HOST;
        return apiKey.split('_')[1] === 'test' ? Endpoint.TEST : Endpoint.LIVE;
    }
}
