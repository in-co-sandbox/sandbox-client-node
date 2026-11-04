import { defineConfig, mergeConfig } from 'vitest/config';

/**
 * Matches the compiler's decorator behavior while allowing package-owned fixtures and setup.
 * @param {import("vitest/config").ViteUserConfig} [config]
 * @returns {import("vitest/config").ViteUserConfig}
 */
export function createVitestConfig(config = {}) {
    const mergedConfig = mergeConfig(
        defineConfig({
            oxc: { decorator: { legacy: true, emitDecoratorMetadata: false } },
            test: {
                environment: 'node',
                globals: true,
                maxWorkers: 2,
                include: ['tests/**/*.test.ts'],
                exclude: ['node_modules/**', 'dist/**', '.build/**', 'generated/**'],
                clearMocks: true,
                restoreMocks: true,
            },
        }),
        config,
    );
    // A dedicated suite must not inherit the default suite's files.
    if (config.test?.include) mergedConfig.test.include = config.test.include;
    return mergedConfig;
}
