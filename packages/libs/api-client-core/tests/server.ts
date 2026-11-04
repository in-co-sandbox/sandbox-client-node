import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

/** An unsigned JWT; the client only decodes tokens, it never verifies them. */
export function token(claims: { iss?: string; exp?: number }): string {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.signature`;
}

export const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
export const anHourAgo = () => Math.floor(Date.now() / 1000) - 3600;

export interface FakeApi {
    url: string;
    /** Path and headers of every request, in order. */
    requests: { path: string; headers: IncomingHttpHeaders }[];
    /** Returns the token the next sign-in hands out. */
    nextToken: () => string;
    close: () => Promise<void>;
}

/** A Sandbox API stand-in: `/authenticate` signs in with secret "secret", any other path answers 200. */
export async function startFakeApi(nextToken: () => string): Promise<FakeApi> {
    const api: FakeApi = { url: '', requests: [], nextToken, close: async () => {} };
    const server: Server = createServer((request, response) => {
        api.requests.push({ path: request.url ?? '', headers: request.headers });
        response.setHeader('Content-Type', 'application/json');
        if (request.url === '/authenticate') {
            if (request.headers['x-api-secret'] !== 'secret') {
                response.statusCode = 401;
                response.end(JSON.stringify({ code: 401, message: 'Invalid' }));
                return;
            }
            response.end(JSON.stringify({ code: 200, data: { access_token: api.nextToken() } }));
            return;
        }
        response.end(JSON.stringify({ code: 200, data: { ok: true } }));
    });
    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });
    api.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    api.close = () =>
        new Promise((resolve) => {
            server.close(() => resolve());
        });
    return api;
}
