import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { isBuiltin } from 'node:module';
import { resolve } from 'node:path';
import sourcemaps from 'rollup-plugin-sourcemaps';

/** Bundles the compiled Lambda and its runtime dependencies into the deployment entry point. */
export function createLambdaConfig() {
    /** @type {import("rollup").RollupOptions} */
    const config = {
        input: resolve('.build/src/index.js'),
        external: (moduleId) => isBuiltin(moduleId) || moduleId === 'aws-sdk',
        preserveEntrySignatures: 'strict',
        plugins: [
            sourcemaps(),
            // Legacy clients require the callable CommonJS export of dual-package dependencies.
            nodeResolve({ mainFields: ['main', 'module'], exportConditions: ['node'], preferBuiltins: true }),
            json(),
            commonjs({ transformMixedEsModules: true, requireReturnsDefault: 'auto', requireNodeBuiltins: true }),
            // Inlining CommonJS wrappers can break references when function names are retained.
            terser({ keep_classnames: true, keep_fnames: true, compress: { inline: false }, maxWorkers: 2 }),
        ],
        output: {
            file: 'dist/index.mjs',
            format: 'es',
            inlineDynamicImports: true,
            sourcemap: true,
            // Bundled CommonJS packages still use Node's require.main and dynamic require.
            banner: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
        },
        onwarn(warning, warn) {
            if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
            warn(warning);
        },
    };
    return config;
}
