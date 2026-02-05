import { SandboxException } from '../exception/SandboxException';

export class EndpointBuilder {
    /**
     * Builds an endpoint URL by replacing placeholders in the URL template with
     * provided path parameters and appending query parameters.
     *
     * @param url - The URL template that may include placeholders in the format {param}.
     * @param pathParams - An object mapping placeholder names to their replacement values.
     * @param queryParams - An object mapping query parameter names to their values (string or array of strings).
     * @returns The fully constructed URL as a string.
     *
     * @example
     * const url = 'https://api.example.com/users/{userId}/details';
     * const builtUrl = EndpointBuilder.build(url, { userId: '123' }, { sort: 'asc', tags: ['tag1', 'tag2'] });
     * Result: 'https://api.example.com/users/123/details?sort=asc&tags=tag1&tags=tag2'
     */
    public static build(
        url: string,
        pathParams?: Record<string, string>,
        queryParams?: Record<string, string | string[] | undefined>,
    ): string;

    /**
     * Builds an endpoint URL by appending a single path segment to the given base URL.
     *
     * @param baseUrl - The base URL.
     * @param path - The path segment to append to the base URL.
     * @returns The fully constructed URL as a string.
     *
     * @example
     * const baseUrl = 'https://api.example.com/base';
     * const builtUrl = EndpointBuilder.build(baseUrl, 'segment');
     * Result: 'https://api.example.com/base/segment'
     */
    public static build(baseUrl: string, path: string): string;

    // Implementation of the overloaded methods
    public static build(
        urlOrBaseUrl: string,
        pathParamsOrPath?: Record<string, string> | string,
        queryParams?: Record<string, string | string[]>,
    ): string {
        try {
            // If queryParams is defined, we assume the three-parameter overload was called.
            if (queryParams || typeof queryParams === 'object') {
                let url = urlOrBaseUrl;
                // Replace path parameters in the URL template.
                if (pathParamsOrPath && typeof pathParamsOrPath === 'object') {
                    Object.keys(pathParamsOrPath).forEach((key) => {
                        // Replace the placeholder with the corresponding value.
                        url = url.replace(`{${key}}`, pathParamsOrPath[key]);
                    });
                }
                // Create a URL object. This assumes that the input URL is absolute.
                const constructedUrl = new URL(url);
                // Append query parameters.
                if (queryParams) {
                    Object.keys(queryParams).forEach((key) => {
                        if (queryParams[key] === undefined) return;
                        const value = queryParams[key];
                        if (Array.isArray(value)) {
                            // Handle array values - add multiple entries with the same key
                            value.forEach((item) => {
                                constructedUrl.searchParams.append(key, item);
                            });
                        } else {
                            // Handle single value
                            constructedUrl.searchParams.append(key, value);
                        }
                    });
                }
                return constructedUrl.toString();
            }
            // Otherwise, the two-parameter overload was called: baseUrl and a single path segment.
            const baseUrl = urlOrBaseUrl;
            const pathSegment = pathParamsOrPath as string;
            // Create a URL object from the base URL.
            const constructedUrl = new URL(baseUrl);
            // Ensure the base pathname ends with a slash if it's not empty and doesn't already end with one.
            if (constructedUrl.pathname !== '' && !constructedUrl.pathname.endsWith('/')) {
                constructedUrl.pathname += '/';
            }
            // Append the path segment without encoding it if it starts with a slash
            let pathName = constructedUrl.pathname.toString();
            if (pathSegment.startsWith('/')) {
                // Remove the leading slash to avoid double slashes
                pathName += pathSegment.substring(1);
            } else {
                pathName += pathSegment;
            }
            return constructedUrl.origin.toString().concat(pathName);
        } catch (error) {
            throw new SandboxException(`Error building URL: ${error}`);
        }
    }
}
