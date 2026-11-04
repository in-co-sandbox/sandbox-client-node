import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiUserCredentials, AuthRequestInterceptor } from '../src';
import { anHourAgo, inOneHour, token } from './server';

/** An interceptor whose sign-in call answers with `body`, so no request leaves the test. */
function interceptorWithSignInBody(body: Record<string, unknown>) {
    const interceptor = new AuthRequestInterceptor(new ApiUserCredentials('key_live_123', 'secret'));
    const post = vi.fn(async (url: string) => ({ url, data: body }));
    (interceptor as unknown as { authClient: { post: typeof post } }).authClient.post = post;
    return { interceptor, post };
}

/** An interceptor whose sign-in call succeeds with `accessToken`. */
function interceptorWithSignIn(accessToken: string) {
    return interceptorWithSignInBody({ code: 200, data: { access_token: accessToken } });
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

    it('reports the error code and message the API returns with HTTP 200', async () => {
        const { interceptor } = interceptorWithSignInBody({
            code: 403,
            message: 'API key is suspended',
            transaction_id: 'txn-1',
            timestamp: 1_700_000_000_000,
        });

        await expect(interceptor.intercept(request())).rejects.toMatchObject({
            code: 403,
            message: 'API key is suspended',
            transactionId: 'txn-1',
        });
    });

    it('reports a 401 in the response body as invalid credentials', async () => {
        const { interceptor } = interceptorWithSignInBody({ code: 401, message: 'Unauthorized' });

        await expect(interceptor.intercept(request())).rejects.toMatchObject({
            code: 401,
            message: 'Invalid api key or secret',
        });
    });

    it('accepts sandbox.co.in issuers and rejects hosts that only contain the name', async () => {
        const { interceptor } = interceptorWithSignIn('unused');
        const owner = (iss: string) => request(token({ iss, exp: inOneHour() }));

        await expect(interceptor.intercept(owner('accounts.sandbox.co.in'))).resolves.toBeDefined();
        await expect(interceptor.intercept(owner('https://sandbox.co.in'))).resolves.toBeDefined();
        await Promise.all(
            ['sandbox.co.in.example.com', 'notsandbox.co.in', 'example.com/sandbox.co.in'].map((iss) =>
                expect(interceptor.intercept(owner(iss))).rejects.toMatchObject({
                    code: 401,
                    message: `Invalid token issuer: ${iss}`,
                }),
            ),
        );
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
