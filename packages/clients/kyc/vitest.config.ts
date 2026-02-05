import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts'],
        exclude: ['dist/**', 'node_modules/**', 'tests/integration/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        setupFiles: ['./vitest.setup.ts'],
        testTimeout: 100000,
    },
});
