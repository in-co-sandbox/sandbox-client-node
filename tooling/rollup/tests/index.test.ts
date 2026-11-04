import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';

const presetUrl = new URL('../src/library.js', import.meta.url).href;
const lambdaPresetUrl = new URL('../src/lambda.js', import.meta.url).href;
const rollupUrl = import.meta.resolve('rollup');
const compilerPath = fileURLToPath(new URL('./bin/tsc', import.meta.resolve('typescript/package.json')));
const buildCommand = fileURLToPath(new URL('../src/bin.js', import.meta.url));
let packageDirectory: string;

function writeFile(path: string, contents: string) {
    const filePath = join(packageDirectory, path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, contents);
}

function runNode(script: string, moduleType = 'module') {
    return execFileSync(process.execPath, [`--input-type=${moduleType}`, '-e', script], {
        cwd: packageDirectory,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
}

function buildLibrary(
    options: NonNullable<Parameters<typeof import('../src/library.js').createLibraryConfig>[0]> = {},
) {
    const compilation = runCompiler();
    expect(compilation.status, compilation.stdout + compilation.stderr).toBe(0);
    runNode(`
        import { rollup } from ${JSON.stringify(rollupUrl)};
        import { createLibraryConfig } from ${JSON.stringify(presetUrl)};
        for (const config of createLibraryConfig(${JSON.stringify(options)})) {
            const bundle = await rollup(config);
            for (const output of Array.isArray(config.output) ? config.output : [config.output]) await bundle.write(output);
            await bundle.close();
        }
    `);
}

function runCompiler() {
    return spawnSync(process.execPath, [compilerPath, '-p', 'tsconfig.build.json'], {
        cwd: packageDirectory,
        encoding: 'utf8',
    });
}

function writeLibrary() {
    writeFile('index.ts', 'export { getPan, type Payee } from "./src/payee/index";\n');
    writeFile('src/payee/index.ts', 'export { getPan, type Payee } from "./Payee";\n');
    writeFile(
        'src/payee/Payee.ts',
        'export interface Payee { pan: string; }\nexport function getPan(payee: Payee): string { return payee.pan; }\n',
    );
    writeFile(
        'src/default/index.ts',
        'import type { Payee } from "../payee/index";\nexport default function getPan(payee: Payee): string { return payee.pan; }\n',
    );
}

beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), 'sandbox-library-'));
    writeFile(
        'tsconfig.build.json',
        JSON.stringify({
            compilerOptions: {
                target: 'ESNext',
                module: 'ESNext',
                moduleResolution: 'Bundler',
                strict: true,
                declaration: true,
                declarationMap: true,
                sourceMap: true,
                rootDir: '.',
                outDir: '.build',
                types: [],
            },
            include: ['index.ts', 'src/**/*.ts'],
        }),
    );
    writeFile(
        'package.json',
        JSON.stringify({
            name: 'sandbox-config-fixture',
            type: 'module',
            exports: {
                '.': {
                    import: { types: './dist/esm/index.d.ts', default: './dist/esm/index.js' },
                    require: { types: './dist/cjs/index.d.cts', default: './dist/cjs/index.cjs' },
                },
                './default': {
                    import: { types: './dist/esm/src/default/index.d.ts', default: './dist/esm/src/default/index.js' },
                    require: {
                        types: './dist/cjs/src/default/index.d.cts',
                        default: './dist/cjs/src/default/index.cjs',
                    },
                },
                './payee': {
                    import: { types: './dist/esm/src/payee/Payee.d.ts', default: './dist/esm/src/payee/Payee.js' },
                    require: { types: './dist/cjs/src/payee/Payee.d.cts', default: './dist/cjs/src/payee/Payee.cjs' },
                },
            },
        }),
    );
});

afterEach(() => rmSync(packageDirectory, { recursive: true, force: true }));

it('builds a library through the shared command and removes stale output', () => {
    writeLibrary();
    mkdirSync(join(packageDirectory, 'node_modules'));
    symlinkSync(
        dirname(fileURLToPath(import.meta.resolve('typescript/package.json'))),
        join(packageDirectory, 'node_modules/typescript'),
        'junction',
    );
    writeFile('dist/stale.js', 'stale output');
    writeFile('.build/stale.js', 'stale output');

    const result = spawnSync(process.execPath, [buildCommand, 'lib'], { cwd: packageDirectory, encoding: 'utf8' });

    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(existsSync(join(packageDirectory, 'dist/stale.js'))).toBe(false);
    expect(existsSync(join(packageDirectory, '.build/stale.js'))).toBe(false);
    expect(existsSync(join(packageDirectory, 'dist/index.d.ts'))).toBe(true);
    expect(runNode('import { getPan } from "./dist/index.js"; console.log(getPan({ pan: "ABCDE1234F" }));')).toBe(
        'ABCDE1234F',
    );
});

it('rejects unsupported command arguments before removing output', () => {
    writeFile('dist/keep.js', 'existing output');

    const result = spawnSync(process.execPath, [buildCommand, 'lambda'], { cwd: packageDirectory, encoding: 'utf8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Usage: sandbox-rollup lib');
    expect(readFileSync(join(packageDirectory, 'dist/keep.js'), 'utf8')).toBe('existing output');
});

it('stops the build when production sources fail type checking', () => {
    writeFile('index.ts', 'export const invalidValue: number = "invalid";\n');
    mkdirSync(join(packageDirectory, 'node_modules'));
    symlinkSync(
        dirname(fileURLToPath(import.meta.resolve('typescript/package.json'))),
        join(packageDirectory, 'node_modules/typescript'),
        'junction',
    );

    const result = spawnSync(process.execPath, [buildCommand, 'lib'], { cwd: packageDirectory, encoding: 'utf8' });

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("not assignable to type 'number'");
    expect(existsSync(join(packageDirectory, 'dist/index.js'))).toBe(false);
});

it('loads CommonJS and dual-package dependencies in a minified ESM Lambda and preserves diagnostic names', () => {
    writeFile('node_modules/legacy-fetch/package.json', JSON.stringify({ main: 'index.cjs', module: 'index.mjs' }));
    writeFile(
        'node_modules/legacy-fetch/index.cjs',
        `async function fetch() { return { text: async () => "captcha-text" }; }
        class Headers {}
        module.exports = fetch;
        module.exports.Headers = Headers;`,
    );
    writeFile(
        'node_modules/legacy-fetch/index.mjs',
        `export default async function fetch() { return { text: async () => "captcha-text" }; }
        export class Headers {}`,
    );
    writeFile(
        '.build/src/captcha-client.cjs',
        `const fetch = require("legacy-fetch");
        module.exports = async function parseCaptcha() { return (await fetch()).text(); };`,
    );
    writeFile(
        '.build/src/assertString.cjs',
        `Object.defineProperty(exports, "__esModule", { value: true });
        exports.default = assertString;
        function assertString(value) { if (typeof value !== "string") throw new TypeError("Expected a string"); }
        module.exports = exports.default;
        module.exports.default = exports.default;`,
    );
    writeFile(
        '.build/src/isLength.cjs',
        `Object.defineProperty(exports, "__esModule", { value: true });
        if (require.main === module) throw new Error("Dependency must not run as a command");
        exports.default = isLength;
        const assertString = require("./assertString.cjs");
        function isLength(value) { assertString(value); return value.length === 10; }
        module.exports = exports.default;
        module.exports.default = exports.default;`,
    );
    writeFile(
        '.build/src/index.js',
        `import isLength from "./isLength.cjs";
        export { default as parseCaptcha } from "./captcha-client.cjs";
        class InvalidPanError extends Error {}
        export function handleRoute(pan) {
            if (!isLength(pan)) throw new InvalidPanError("Invalid PAN");
            return handleRoute.name;
        }`,
    );
    writeFile(
        'build.mjs',
        `
        import { rollup } from ${JSON.stringify(rollupUrl)};
        import { createLambdaConfig } from ${JSON.stringify(lambdaPresetUrl)};
        const config = createLambdaConfig();
        const bundle = await rollup(config);
        await bundle.write(config.output);
        await bundle.close();
    `,
    );
    execFileSync(process.execPath, [join(packageDirectory, 'build.mjs')], { cwd: packageDirectory, stdio: 'pipe' });
    expect(
        runNode(`
            import { handleRoute, parseCaptcha } from "./dist/index.mjs";
            console.log(handleRoute("ABCDE1234F"));
            try { handleRoute("invalid"); } catch (error) { console.log(error.constructor.name); }
            console.log(await parseCaptcha());
        `),
    ).toBe('handleRoute\nInvalidPanError\ncaptcha-text');
});

it('publishes a library that ESM and CommonJS consumers can load and type-check', () => {
    writeLibrary();
    buildLibrary({
        output: [
            { dir: 'dist/esm', format: 'es' },
            { dir: 'dist/cjs', format: 'cjs', entryFileNames: '[name].cjs' },
        ],
    });

    expect(
        runNode('import { getPan } from "sandbox-config-fixture"; console.log(getPan({ pan: "ABCDE1234F" }));'),
    ).toBe('ABCDE1234F');
    expect(
        runNode(
            'const { getPan } = require("sandbox-config-fixture"); console.log(getPan({ pan: "ABCDE1234F" }));',
            'commonjs',
        ),
    ).toBe('ABCDE1234F');
    expect(
        runNode('import { getPan } from "sandbox-config-fixture/payee"; console.log(getPan({ pan: "ABCDE1234F" }));'),
    ).toBe('ABCDE1234F');
    expect(
        runNode('import getPan from "sandbox-config-fixture/default"; console.log(getPan({ pan: "ABCDE1234F" }));'),
    ).toBe('ABCDE1234F');
    expect(
        runNode(
            'const { default: getPan } = require("sandbox-config-fixture/default"); console.log(getPan({ pan: "ABCDE1234F" }));',
            'commonjs',
        ),
    ).toBe('ABCDE1234F');

    writeFile(
        'consumer.mts',
        'import { getPan, type Payee } from "sandbox-config-fixture/payee";\nimport getDefaultPan from "sandbox-config-fixture/default";\nconst payee: Payee = { pan: "ABCDE1234F" };\nconst pan: string = getPan(payee);\nconst defaultPan: string = getDefaultPan(payee);\n',
    );
    writeFile(
        'consumer.cts',
        'import fixture = require("sandbox-config-fixture");\nimport defaultFixture = require("sandbox-config-fixture/default");\nconst payee: fixture.Payee = { pan: "ABCDE1234F" };\nconst pan: string = fixture.getPan(payee);\nconst defaultPan: string = defaultFixture.default(payee);\n',
    );
    writeFile(
        'tsconfig.json',
        JSON.stringify({
            compilerOptions: {
                module: 'NodeNext',
                moduleResolution: 'NodeNext',
                strict: true,
                noEmit: true,
                types: [],
            },
            include: ['consumer.mts', 'consumer.cts'],
        }),
    );
    const consumerCompilation = spawnSync(process.execPath, [compilerPath, '-p', 'tsconfig.json'], {
        cwd: packageDirectory,
        encoding: 'utf8',
    });
    expect(consumerCompilation.status, consumerCompilation.stdout + consumerCompilation.stderr).toBe(0);
});

it('rejects Node.js built-ins in a browser library', () => {
    writeLibrary();
    writeFile('index.ts', 'export { basename } from "node:path";\n');
    writeFile('src/node-path.d.ts', 'declare module "node:path" { export function basename(path: string): string; }\n');
    expect(() => buildLibrary({ platform: 'browser' })).toThrow(/Node\.js built-in/);
});

it('compiles production Node.js sources without test globals', () => {
    writeFile(
        'tsconfig.json',
        JSON.stringify({
            extends: fileURLToPath(import.meta.resolve('@in-co-sandbox/typescript-config/base.json')),
            compilerOptions: {
                typeRoots: [fileURLToPath(new URL('../', import.meta.resolve('@types/node/package.json')))],
                types: [fileURLToPath(new URL('globals.d.ts', import.meta.resolve('vitest/package.json')))],
            },
        }),
    );
    writeFile(
        'tsconfig.build.json',
        JSON.stringify({
            extends: [
                './tsconfig.json',
                fileURLToPath(import.meta.resolve('@in-co-sandbox/typescript-config/build.json')),
            ],
        }),
    );
    writeFile('index.ts', 'export { readMode } from "./src/index";\n');
    writeFile(
        'src/index.ts',
        'export function readMode(environment: NodeJS.ProcessEnv = process.env): string | undefined { return environment.NODE_ENV; }\n',
    );
    writeFile('tests/invalid.test.ts', 'const invalidValue: never = "exclude test files from production";\n');

    const compilation = runCompiler();
    expect(compilation.status, compilation.stdout + compilation.stderr).toBe(0);
    buildLibrary();
    expect(runNode('import { readMode } from "./dist/index.js"; console.log(readMode({ NODE_ENV: "test" }));')).toBe(
        'test',
    );

    writeFile('src/test.ts', 'export const assertion = expect(true);\n');
    const invalidCompilation = runCompiler();
    expect(invalidCompilation.status).not.toBe(0);
    expect(invalidCompilation.stdout).toContain("Cannot find name 'expect'");
});
