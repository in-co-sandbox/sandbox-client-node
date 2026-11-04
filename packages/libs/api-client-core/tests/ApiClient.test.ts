import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiClientBuilder, ApiUserCredentials, SandboxException } from '../src';
import { anHourAgo, type FakeApi, inOneHour, startFakeApi, token } from './server';

describe('ApiClient authentication', () => {
    let api: FakeApi;
    const credentials = new ApiUserCredentials('key_live_123', 'secret');

    beforeEach(async () => {
        api = await startFakeApi(() => token({ iss: '127.0.0.1', exp: inOneHour() }));
        vi.stubEnv('SANDBOX_API_HOST', api.url);
    });

    afterEach(async () => {
        vi.unstubAllEnvs();
        await api.close();
    });

    const paths = () => api.requests.map((request) => request.path);
    const build = () => new ApiClientBuilder().withCredentials(credentials);

    it('signs in once at SANDBOX_API_HOST and reuses the token', async () => {
        const client = build().build(ApiClient);

        await client.get(`${api.url}/one`);
        await client.get(`${api.url}/two`);

        expect(paths()).toEqual(['/authenticate', '/one', '/two']);
        const [signIn, first, second] = api.requests;
        expect(signIn.headers['x-api-key']).toBe('key_live_123');
        expect(signIn.headers['x-api-secret']).toBe('secret');
        expect(first.headers.authorization).toBeTruthy();
        expect(second.headers.authorization).toBe(first.headers.authorization);
        expect(first.headers['x-api-key']).toBe('key_live_123');
        expect(first.headers['x-api-version']).toBe('1.0.0');
        expect(first.headers['user-agent']).toMatch(/^in-co-sandbox\.api-client-core\/2\.0\.0/);
    });

    it('signs in again once the cached token expires', async () => {
        const tokens = [token({ iss: '127.0.0.1', exp: anHourAgo() }), token({ iss: '127.0.0.1', exp: inOneHour() })];
        api.nextToken = () => tokens.shift()!;
        const client = build().build(ApiClient);

        await client.get(`${api.url}/one`);
        await client.get(`${api.url}/two`);

        expect(paths()).toEqual(['/authenticate', '/one', '/authenticate', '/two']);
    });

    it('keeps a resource owner token the caller sets', async () => {
        const ownerToken = token({ iss: 'accounts.sandbox.co.in', exp: inOneHour() });
        const client = build().build(ApiClient);

        await client.get(`${api.url}/one`, { Authorization: ownerToken });

        expect(paths()).toEqual(['/one']);
        expect(api.requests[0].headers.authorization).toBe(ownerToken);
    });

    it('rejects an expired resource owner token and a foreign issuer', async () => {
        const client = build().build(ApiClient);

        const expired = token({ iss: 'accounts.sandbox.co.in', exp: anHourAgo() });
        await expect(client.get(`${api.url}/one`, { Authorization: expired })).rejects.toMatchObject({ code: 401 });
        const foreign = token({ iss: 'example.com', exp: inOneHour() });
        await expect(client.get(`${api.url}/one`, { Authorization: foreign })).rejects.toBeInstanceOf(SandboxException);
        expect(paths()).toEqual([]);
    });

    it('reports wrong credentials as a 401', async () => {
        const client = new ApiClientBuilder()
            .withCredentials(new ApiUserCredentials('key_live_123', 'wrong'))
            .build(ApiClient);

        await expect(client.get(`${api.url}/one`)).rejects.toMatchObject({ code: 401 });
    });

    it('uses a custom interceptor from withAuth instead of signing in', async () => {
        const client = build()
            .withAuth((config) => {
                config.headers.set('Authorization', 'custom');
                return config;
            })
            .build(ApiClient);

        await client.get(`${api.url}/one`);

        expect(paths()).toEqual(['/one']);
        expect(api.requests[0].headers.authorization).toBe('custom');
    });

    it('sends requests unauthenticated with withAuth(false)', async () => {
        const client = build().withAuth(false).build(ApiClient);

        await client.get(`${api.url}/one`);

        expect(paths()).toEqual(['/one']);
        expect(api.requests[0].headers.authorization).toBeUndefined();
    });

    it('runs request interceptors after authentication', async () => {
        const seen: unknown[] = [];
        const client = build()
            .withRequestInterceptors([
                (config) => {
                    seen.push(config.headers.Authorization);
                    return config;
                },
            ])
            .build(ApiClient);

        await client.get(`${api.url}/one`);

        expect(seen).toHaveLength(1);
        expect(seen[0]).toBeTruthy();
    });
});

describe('ApiClientBuilder.withHost', () => {
    let uat: FakeApi;
    let prod: FakeApi;

    beforeEach(async () => {
        uat = await startFakeApi(() => token({ iss: '127.0.0.1', exp: inOneHour() }));
        prod = await startFakeApi(() => token({ iss: '127.0.0.1', exp: inOneHour() }));
    });

    afterEach(async () => {
        vi.unstubAllEnvs();
        await Promise.all([uat.close(), prod.close()]);
    });

    const pathsOf = (api: FakeApi) => api.requests.map((request) => request.path);

    it('lets two clients in one process sign in at and call different hosts', async () => {
        // The process is configured for uat; one client still talks to production.
        vi.stubEnv('SANDBOX_API_HOST', uat.url);
        const uatClient = new ApiClientBuilder()
            .withCredentials(new ApiUserCredentials('key_live_uat', 'secret'))
            .build(ApiClient);
        const prodClient = new ApiClientBuilder()
            .withCredentials(new ApiUserCredentials('key_live_prod', 'secret'))
            .withHost(`${prod.url}/`)
            .build(ApiClient);

        expect(uatClient.getBaseUrl()).toBe(uat.url);
        expect(prodClient.getBaseUrl()).toBe(prod.url);

        await uatClient.get(`${uatClient.getBaseUrl()}/pan`);
        await prodClient.get(`${prodClient.getBaseUrl()}/eri`);

        expect(pathsOf(uat)).toEqual(['/authenticate', '/pan']);
        expect(pathsOf(prod)).toEqual(['/authenticate', '/eri']);
        expect(uat.requests[0].headers['x-api-key']).toBe('key_live_uat');
        expect(prod.requests[0].headers['x-api-key']).toBe('key_live_prod');
    });

    it('falls back to SANDBOX_API_HOST, then the key, without withHost', () => {
        const credentials = new ApiUserCredentials('key_test_123', 'secret');

        expect(new ApiClientBuilder().withCredentials(credentials).build(ApiClient).getBaseUrl()).toBe(
            'https://test-api.sandbox.co.in',
        );
        vi.stubEnv('SANDBOX_API_HOST', uat.url);
        expect(new ApiClientBuilder().withCredentials(credentials).build(ApiClient).getBaseUrl()).toBe(uat.url);
    });
});

describe('ApiClientBuilder', () => {
    const timeoutOf = (client: ApiClient) =>
        (client as unknown as { client: { defaults: { timeout: number } } }).client.defaults.timeout;

    it('requires credentials', () => {
        expect(() => new ApiClientBuilder().build(ApiClient)).toThrow(SandboxException);
    });

    it('keeps settings per builder', () => {
        const credentials = new ApiUserCredentials('key_live_123', 'secret');
        const slow = new ApiClientBuilder().withTimeout(120).withCredentials(credentials);
        const normal = new ApiClientBuilder().withCredentials(credentials);

        expect(timeoutOf(slow.build(ApiClient))).toBe(120_000);
        expect(timeoutOf(normal.build(ApiClient))).toBe(ApiClientBuilder.TIMEOUT * 1000);
    });
});
