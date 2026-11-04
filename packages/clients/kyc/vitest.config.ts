import { createVitestConfig } from '@in-co-sandbox/vitest-config';

// The tests call the Sandbox API, so they need time for each round trip.
export default createVitestConfig({ test: { testTimeout: 100_000 } });
