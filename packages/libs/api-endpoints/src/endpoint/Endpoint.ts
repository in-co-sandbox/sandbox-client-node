/**
 * Class representing API environments.
 */
export class Endpoint {
    /** Production API endpoint */
    private static readonly LIVE = 'https://api.sandbox.co.in';

    /** UAT API endpoint */
    private static readonly TEST = 'https://test-api.sandbox.co.in';

    /**
     * Gets the environment for an API key.
     *
     * @param apiKey - The API key
     * @returns The environment host URL
     */
    public static get(apiKey: string): string {
        const env = apiKey.split('_')[1];
        switch (env) {
            case 'live':
                return Endpoint.LIVE;
            case 'test':
                return Endpoint.TEST;
            default:
                return Endpoint.LIVE;
        }
    }
}
