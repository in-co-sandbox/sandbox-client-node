#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { rollup } from 'rollup';
import { createLibraryConfig } from './library.js';

// Build the current package with its compiler and the shared library preset.
const args = process.argv.slice(2);
if (args.length !== 1 || args[0] !== 'lib') {
    process.stderr.write('Usage: sandbox-rollup lib\n');
    process.exit(1);
}

const packageRequire = createRequire(resolve('package.json'));
const compiler = join(dirname(packageRequire.resolve('typescript/package.json')), 'bin/tsc');

for (const directory of ['.build', 'dist']) {
    rmSync(resolve(directory), { recursive: true, force: true });
}

const compilation = spawnSync(process.execPath, [compiler, '-p', 'tsconfig.build.json'], { stdio: 'inherit' });
if (compilation.status !== 0) process.exit(compilation.status ?? 1);

await Promise.all(
    createLibraryConfig().map(async (config) => {
        const bundle = await rollup(config);
        try {
            const outputs = Array.isArray(config.output) ? config.output : [config.output ?? {}];
            await Promise.all(outputs.map((output) => bundle.write(output)));
        } finally {
            await bundle.close();
        }
    }),
);
