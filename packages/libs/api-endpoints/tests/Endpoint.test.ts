import { afterEach, describe, expect, it, vi } from 'vitest';
import { Endpoint } from '../src';

describe('Endpoint', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('uses the live host for live keys and unknown keys', () => {
        expect(Endpoint.get('key_live_abc')).toBe('https://api.sandbox.co.in');
        expect(Endpoint.get('something_else')).toBe('https://api.sandbox.co.in');
    });

    it('uses the test host for test keys', () => {
        expect(Endpoint.get('key_test_abc')).toBe('https://test-api.sandbox.co.in');
    });

    it('uses SANDBOX_API_HOST for every key when it is set', () => {
        vi.stubEnv('SANDBOX_API_HOST', 'https://dev-api.sandbox.co.in/');

        expect(Endpoint.get('key_live_abc')).toBe('https://dev-api.sandbox.co.in');
        expect(Endpoint.get('key_test_abc')).toBe('https://dev-api.sandbox.co.in');
    });

    it('ignores an empty SANDBOX_API_HOST', () => {
        vi.stubEnv('SANDBOX_API_HOST', '  ');

        expect(Endpoint.get('key_test_abc')).toBe('https://test-api.sandbox.co.in');
    });

    it('returns the live and test hosts directly', () => {
        expect(Endpoint.live()).toBe(Endpoint.LIVE);
        expect(Endpoint.test()).toBe(Endpoint.TEST);
    });
});
