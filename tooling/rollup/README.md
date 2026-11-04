# Sandbox Rollup configuration

APIs and functions compile TypeScript into `.build`, then use this preset to
bundle their runtime dependencies into `dist/index.mjs`:

```js
import { createLambdaConfig } from '@in-co-sandbox/rollup-config/lambda';

export default createLambdaConfig();
```

Run `tsc -p tsconfig.build.json` before `rollup -c`. The preset reads the
compiler's source maps so debugging the bundle leads back to TypeScript.
The bundle is minified while retaining function and class names. Source maps
allow Node.js to map stack traces to TypeScript when `--enable-source-maps` is
enabled and the `.map` file is included in the deployment ZIP. The preset does
not generate declarations for Lambda bundles.

When a dependency declares both `main` and `module`, the Lambda preset prefers
`main`. This preserves CommonJS clients such as the CAPTCHA client, which expects
`require("node-fetch")` to return a function. The Lambda bundle remains ESM.

The `sandbox-clean` command removes `.build` and `dist` in the current package.
`sandbox-copy-environment` copies `environment` to `dist/environment` for packages
that load runtime configuration files after bundling.

## Libraries

Libraries use the shared command in their package scripts:

```json
{
    "scripts": {
        "build": "sandbox-rollup lib"
    }
}
```

The command removes `.build` and `dist`, runs the owning package's TypeScript
compiler with `tsconfig.build.json`, then packages JavaScript and declarations
into `dist` using the library preset. Compilation failures stop the build.
No package-level `rollup.config.mjs` is needed. The package declares TypeScript
and `@in-co-sandbox/rollup-config` as development dependencies.

For builds that need custom output options, the library preset remains available:

```js
import { createLibraryConfig } from '@in-co-sandbox/rollup-config/library';

export default createLibraryConfig();
```

Run generation first when required, then `tsc -p tsconfig.build.json` and
`rollup -c`. Compiled modules become entry points so direct-file exports retain
their matching declarations. Dependencies stay external,
code remains unminified, and `package.json` owns the export map.

The default output is Node.js ESM with the existing directory layout in `dist`.
Set `root: ".build/src"` only when the package's public exports omit `src`.

For both module formats, use Rollup's output options:

```js
export default createLibraryConfig({
    output: [
        { dir: 'dist/esm', format: 'es' },
        { dir: 'dist/cjs', format: 'cjs', entryFileNames: '[name].cjs' },
    ],
});
```

Declarations use `.d.ts` for ESM and `.d.cts` for CommonJS. The package's export
map must select the corresponding JavaScript and types. CommonJS default
exports remain available through `require("package").default`.

Set `platform: "browser"` to reject Node.js built-ins in library source.
External dependencies must support the chosen runtime too.

The declaration plugin reads the compiler's `.d.ts` files. Its documented
`@typescript/typescript6` compatibility dependency supplies the parsing API;
application compilation and type checking still use TypeScript 7.1 beta.
Legacy decorator behavior remains controlled by the shared TypeScript presets.
