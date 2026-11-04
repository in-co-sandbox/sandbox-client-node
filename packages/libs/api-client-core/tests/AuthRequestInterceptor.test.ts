import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiUserCredentials, AuthRequestInterceptor } from '../src';
import { anHourAgo, inOneHour, token } from './server';

/** An interceptor whose sign-in call is replaced, so no request leaves the test. */
function interceptorWithSignIn(accessToken: string) {
    const interceptor = new AuthRequestInterceptor(new ApiUserCredentials('key_live_123', 'secret'));
    const post = vi.fn(async (url: string) => ({ url, data: { code: 200, data: { access_token: accessToken } } }));
    (interceptor as unknown as { authClient: { post: typeof post } }).authClient.post = post;
    return { interceptor, post };
}

const request = (authorization?: string): InternalAxiosRequestConfig => {
    const headers = new AxiosHeaders();
    if (authorization) headers.Authorization = authorization;
    return { url: 'https://example.sandbox.co.in/any', headers };
};

describe('AuthRequestInterceptor', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('refreshes an expired API user token issued by the API host', async () => {
        vi.stubEnv('SANDBOX_API_HOST', 'https://dev-api.sandbox.co.in');
        const fresh = token({ iss: 'dev-api.sandbox.co.in', exp: inOneHour() });
        const { interceptor, post } = interceptorWithSignIn(fresh);

        const stale = token({ iss: 'dev-api.sandbox.co.in', exp: anHourAgo() });
        const config = await interceptor.intercept(request(stale));

        expect(config.headers.Authorization).toBe(fresh);
        expect(post).toHaveBeenCalledWith('https://dev-api.sandbox.co.in/authenticate', '{}', expect.anything());
    });

    it('signs in at the live host without SANDBOX_API_HOST', async () => {
        const { interceptor, post } = interceptorWithSignIn(token({ iss: 'api.sandbox.co.in', exp: inOneHour() }));

        await interceptor.intercept(request());

        expect(post.mock.calls[0][0]).toBe('https://api.sandbox.co.in/authenticate');
    });

    it('leaves the sign-in request itself alone', async () => {
        const { interceptor, post } = interceptorWithSignIn('unused');
        const signIn: InternalAxiosRequestConfig = {
            url: 'https://api.sandbox.co.in/authenticate',
            headers: new AxiosHeaders(),
        };

        const config = await interceptor.intercept(signIn);

        expect(config.headers.Authorization).toBeUndefined();
        expect(post).not.toHaveBeenCalled();
    });
});
