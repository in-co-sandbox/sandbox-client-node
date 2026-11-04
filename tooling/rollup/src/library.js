import { nodeResolve } from '@rollup/plugin-node-resolve';
import { globSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import { isAbsolute, relative, resolve } from 'node:path';
import { dts } from 'rollup-plugin-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';

/**
 * Packages the compiler's JavaScript and declarations without bundling dependencies.
 * Set root to `.build/src` only when public exports omit the source directory.
 * @param {{root?: string, platform?: "node" | "browser" | "neutral", output?: import("rollup").OutputOptions | import("rollup").OutputOptions[]}} [options]
 * @returns {import("rollup").RollupOptions[]}
 */
export function createLibraryConfig({
    root = '.build',
    platform = 'node',
    output = { dir: 'dist', format: 'es' },
} = {}) {
    const inputRoot = resolve(root);
    const input = Object.fromEntries(
        Array.from(globSync('**/*.js', { cwd: inputRoot })).map((file) => [
            relative(inputRoot, resolve(inputRoot, file)).replaceAll('\\', '/').replace(/\.js$/, ''),
            resolve(inputRoot, file),
        ]),
    );
    /** @type {import("rollup").OutputOptions[]} */
    const outputs = (Array.isArray(output) ? output : [output]).map((settings) => ({
        preserveModules: true,
        preserveModulesRoot: inputRoot,
        sourcemap: true,
        exports: 'named',
        ...settings,
    }));
    const declarations = Object.fromEntries(
        Object.entries(input).map(([name, file]) => [name, file.replace(/\.js$/, '.d.ts')]),
    );

    /** @type {import("rollup").ExternalOption} */
    const external = (moduleId) => {
        if (isBuiltin(moduleId) && platform !== 'node')
            throw new Error(`Node.js built-in '${moduleId}' cannot be used in a ${platform} library.`);
        return !moduleId.startsWith('.') && !isAbsolute(moduleId);
    };

    return [
        {
            input,
            external,
            preserveEntrySignatures: 'strict',
            plugins: [
                sourcemaps(),
                nodeResolve({ browser: platform === 'browser', preferBuiltins: platform === 'node' }),
            ],
            output: outputs,
        },
        {
            input: declarations,
            external,
            plugins: [dts({ sourcemap: true })],
            output: outputs.map((settings) => ({
                ...settings,
                format: 'es',
                entryFileNames: settings.format === 'cjs' ? '[name].d.cts' : '[name].d.ts',
            })),
        },
    ];
}
