import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiClientBuilder, ApiUserCredentials, SandboxException } from '../src';
import { anHourAgo, type FakeApi, inOneHour, startFakeApi, token } from './server';

/** The host `Endpoint.get` returns, as an internal build pinned to the fake API would. */
const pinned = vi.hoisted(() => ({ host: '' }));
vi.mock('@in-co-sandbox/api-endpoints', () => ({ Endpoint: { get: () => pinned.host } }));

describe('ApiClient authentication', () => {
    let api: FakeApi;
    const credentials = new ApiUserCredentials('key_live_123', 'secret');

    beforeEach(async () => {
        api = await startFakeApi(() => token({ iss: '127.0.0.1', exp: inOneHour() }));
        pinned.host = api.url;
    });

    afterEach(async () => {
        await api.close();
    });

    const paths = () => api.requests.map((request) => request.path);
    const build = () => new ApiClientBuilder().withCredentials(credentials);

    it('signs in once at the Endpoint host and reuses the token', async () => {
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
