/**
 * Base URLs of the Sandbox API.
 *
 * {@link Endpoint.get} picks the host for an API key:
 * 1. `SANDBOX_API_HOST`, when set, for every key. Sandbox's own services set it per environment.
 * 2. Otherwise the key's environment: `key_test_…` uses {@link Endpoint.test}, any other key {@link Endpoint.live}.
 */
export class Endpoint {
    /** Production API host. */
    public static readonly LIVE: string = 'https://api.sandbox.co.in';

    /** Test API host, for `key_test_…` keys. */
    public static readonly TEST: string = 'https://test-api.sandbox.co.in';

    /** Environment variable that overrides the host for every key. */
    public static readonly HOST_VARIABLE: string = 'SANDBOX_API_HOST';

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
     * @returns `SANDBOX_API_HOST` when set, otherwise the host for the key's environment.
     */
    public static get(apiKey: string): string {
        const override = Endpoint.override();
        if (override) return override;
        return apiKey.split('_')[1] === 'test' ? Endpoint.TEST : Endpoint.LIVE;
    }

    /** Reads `SANDBOX_API_HOST`, without a trailing slash; undefined outside Node.js or when unset. */
    private static override(): string | undefined {
        const value = typeof process === 'undefined' ? undefined : process.env[Endpoint.HOST_VARIABLE]?.trim();
        return value ? value.replace(/\/+$/, '') : undefined;
    }
}
